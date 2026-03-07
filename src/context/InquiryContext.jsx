import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Modal, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { playNotificationSound } from '../utils/playNotificationSound';
import { getValidToken } from '../api/getValidToken';
import { useAuth } from './auth/useAuth';
import urls from '../config';

const InquiryContext = createContext();

export const useInquiry = () => {
    const context = useContext(InquiryContext);
    if (!context) {
        throw new Error('useInquiry must be used within InquiryProvider');
    }
    return context;
};

export const InquiryProvider = ({ children }) => {
    const { notification } = App.useApp();
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [badgeCount, setBadgeCount] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [lastInquiryName, setLastInquiryName] = useState(null);
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const prevAuthRef = useRef(false);
    const dismissedCountRef = useRef(0); // track the badgeCount at time of dismissal
    const badgeCountRef = useRef(0);     // always reflects latest badgeCount for interval callbacks
    const soundIntervalRef = useRef(null);

    // Function to fetch inquiry count
    const fetchInquiryCount = async () => {
        const token = getValidToken();
        if (!token) {
            setBadgeCount(0);
            return;
        }

        try {
            const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/my?page=0&size=50&sort=createdAt,desc`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) return;

            const data = await response.json();
            const content = Array.isArray(data?.content) ? data.content : [];
            const count = content.filter(item => item?.status === 'NEW').length;

            // console.log('InquiryContext: Updating badge count to', count);
            setBadgeCount(count);
        } catch (error) {
            console.error('Failed to fetch inquiry count', error);
        }
    };

    // Trigger refresh
    const triggerRefresh = () => {
        // console.log('🔄 InquiryContext: Refresh triggered, current trigger:', refreshTrigger);
        setRefreshTrigger(prev => {
            const newValue = prev + 1;
            // console.log('🔄 InquiryContext: Setting refresh trigger to:', newValue);
            return newValue;
        });
    };

    // Fetch on mount and when refresh is triggered
    useEffect(() => {
        // console.log('🔍 InquiryContext: Fetching inquiry count (trigger:', refreshTrigger, ')');
        fetchInquiryCount();
    }, [refreshTrigger]);

    // Re-fetch when authentication state changes (e.g. user logs in)
    useEffect(() => {
        if (isAuthenticated && !prevAuthRef.current) {
            // just logged in — fetch fresh count immediately
            fetchInquiryCount();
        }
        if (!isAuthenticated && prevAuthRef.current) {
            // logged out — clear everything
            setBadgeCount(0);
            setShowInquiryModal(false);
            dismissedCountRef.current = 0;
        }
        prevAuthRef.current = isAuthenticated;
    }, [isAuthenticated]);

    // Continuous polling every 30s as a safety net alongside the SSE stream
    useEffect(() => {
        if (!isAuthenticated) return undefined;
        const pollId = setInterval(() => {
            fetchInquiryCount();
        }, 30000);
        return () => clearInterval(pollId);
    }, [isAuthenticated]);

    // Listen to inquiry events
    useEffect(() => {
        // console.log('📡 InquiryContext: Setting up event listeners...');

        const handleInquiryReceived = (event) => {
            // console.log('🔔 InquiryContext: INQUIRY_RECEIVED event detected', event.detail);
            const name = event?.detail?.visitorName
                || event?.detail?.firstName
                || event?.detail?.name
                || 'Customer';
            setLastInquiryName(name);
            // Only reset dismissal (and show modal) if user is NOT already on the inquiry page
            if (window.location.pathname !== '/service-contact-form') {
                dismissedCountRef.current = 0;
            }

            // Wait 1.5 seconds to allow the backend database to actually save the 
            // REST service inquiry before we request the new count from the Java API
            setTimeout(() => {
                triggerRefresh();
            }, 1500);
        };

        const handleInquiryStatusChanged = (event) => {
            // console.log('🔔 InquiryContext: INQUIRY_STATUS_CHANGED event detected');
            triggerRefresh();
        };

        window.addEventListener('INQUIRY_RECEIVED', handleInquiryReceived);
        window.addEventListener('INQUIRY_STATUS_CHANGED', handleInquiryStatusChanged);

        // console.log('✅ InquiryContext: Event listeners registered');

        return () => {
            // console.log('🔌 InquiryContext: Removing event listeners');
            window.removeEventListener('INQUIRY_RECEIVED', handleInquiryReceived);
            window.removeEventListener('INQUIRY_STATUS_CHANGED', handleInquiryStatusChanged);
        };
    }, []);

    const value = {
        badgeCount,
        refreshTrigger,
        triggerRefresh,
        fetchInquiryCount,
    };

    // When user navigates to inquiry page or detail view, auto-close modal, stop sound, and mark as seen
    useEffect(() => {
        const onInquiryPage = location.pathname === '/service-contact-form'
            || location.pathname.startsWith('/service-inquiry-view/');
        if (onInquiryPage) {
            dismissedCountRef.current = badgeCount;
            setShowInquiryModal(false);
        }
    }, [location.pathname, badgeCount]);

    // ── Sound alert ──────────────────────────────────────────────────────────
    // Plays immediately, then every 10 s, for as long as:
    //   • badgeCount > 0  AND  • user is NOT on the inquiry page
    // Dismissing the modal does NOT stop the sound — only visiting the tab does.
    useEffect(() => {
        badgeCountRef.current = badgeCount;

        // Tear down any previous interval first
        if (soundIntervalRef.current) {
            clearInterval(soundIntervalRef.current);
            soundIntervalRef.current = null;
        }

        const onInquiryPage = location.pathname === '/service-contact-form'
            || location.pathname.startsWith('/service-inquiry-view/');
        if (badgeCount <= 0 || onInquiryPage) return undefined;

        // Play once right away, then repeat every 10 s
        try { playNotificationSound(); } catch (e) { /* ignore */ }

        soundIntervalRef.current = setInterval(() => {
            // Always use ref to get latest value — avoids stale closure
            if (badgeCountRef.current <= 0
                || window.location.pathname === '/service-contact-form'
                || window.location.pathname.startsWith('/service-inquiry-view/')) {
                clearInterval(soundIntervalRef.current);
                soundIntervalRef.current = null;
                return;
            }
            try { playNotificationSound(); } catch (e) { /* ignore */ }
        }, 10000);

        return () => {
            if (soundIntervalRef.current) {
                clearInterval(soundIntervalRef.current);
                soundIntervalRef.current = null;
            }
        };
    }, [badgeCount, location.pathname]);

    // ── Modal visibility ─────────────────────────────────────────────────────
    // Separate from sound so dismissing the modal doesn't stop the alert sound.
    useEffect(() => {
        const onInquiryPage = location.pathname === '/service-contact-form'
            || location.pathname.startsWith('/service-inquiry-view/');
        if (badgeCount <= 0 || onInquiryPage || badgeCount <= dismissedCountRef.current) {
            setShowInquiryModal(false);
            return;
        }
        setShowInquiryModal(true);
    }, [badgeCount, location.pathname]);

    return (
        <InquiryContext.Provider value={value}>
            {children}

            <Modal
                open={showInquiryModal}
                onCancel={() => {
                    dismissedCountRef.current = badgeCount;
                    setShowInquiryModal(false);
                }}
                footer={null}
                centered
                width={520}
                closable
                maskClosable={false}
                styles={{
                    content: { borderRadius: 16, padding: '40px 48px', textAlign: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' },
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <BellOutlined style={{ fontSize: 36, color: '#ffffff' }} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>New Service Inquiry</div>
                    <div style={{ fontSize: 16, color: '#bfdbfe' }}>
                        <strong style={{ color: '#ffffff' }}>{lastInquiryName || 'A customer'}</strong> has submitted a new service inquiry
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <Button
                            type="primary"
                            size="large"
                            style={{ borderRadius: 8, paddingInline: 28, background: '#ffffff', borderColor: '#ffffff', color: '#1d4ed8', fontWeight: 600 }}
                            onClick={() => {
                                dismissedCountRef.current = badgeCount;
                                setShowInquiryModal(false);
                                navigate('/service-contact-form');
                            }}
                        >
                            View Inquiry →
                        </Button>
                    </div>
                </div>
            </Modal>
        </InquiryContext.Provider>
    );
};
