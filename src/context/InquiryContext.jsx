import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Modal, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { playNotificationSound } from '../utils/playNotificationSound';
import { getValidToken } from '../api/getValidToken';
import { getAiChatForms } from '../api/getAiChatForms';
import { useAuth } from './auth/useAuth';
import { useNotificationSettings } from './NotificationSettingsContext';
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
    const { settings: notificationSettings } = useNotificationSettings();
    const location = useLocation();
    const navigate = useNavigate();
    const [badgeCount, setBadgeCount] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [lastInquiryName, setLastInquiryName] = useState(null);
    const [targetTab, setTargetTab] = useState('contact-form');
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const prevAuthRef = useRef(false);
    const previousBadgeCountRef = useRef(null);
    const initializedInquiryBaselineRef = useRef(false);
    const dismissedCountRef = useRef(0); // track the badgeCount at time of dismissal
    const badgeCountRef = useRef(0);     // always reflects latest badgeCount for interval callbacks
    const soundIntervalRef = useRef(null);
    const soundDelayTimeoutRef = useRef(null);

    const inquirySettings = notificationSettings?.inquiries;
    const inquiryEnabled = inquirySettings?.enabled !== false;
    const inquiryShowModal = inquirySettings?.showModal !== false;
    const inquirySound = inquirySettings?.sound || 'none';
    const inquiryVolume = typeof inquirySettings?.volume === 'number' ? inquirySettings.volume : 100;
    const inquiryFrequency = typeof inquirySettings?.frequency === 'string' ? inquirySettings.frequency : 'every';
    const inquiryDelay = typeof inquirySettings?.delay === 'number' ? inquirySettings.delay : 0;

    const parseFrequencyMs = (frequency) => {
        if (!frequency || frequency === 'every') return null;
        if (frequency === '10s') return 10000;
        if (frequency === '30s') return 30000;
        if (frequency === '1m') return 60000;
        if (frequency === '5m') return 300000;
        return null;
    };

    const playInquirySound = () => {
        if (!inquiryEnabled) return;
        if (typeof inquirySound === 'string' && inquirySound.toLowerCase() === 'none') return;

        playNotificationSound({
            sound: inquirySound,
            volume: inquiryVolume,
            type: 'inquiries',
        });
    };

    // Function to fetch inquiry count
    const fetchInquiryCount = async () => {
        const token = getValidToken();
        if (!token) {
            setBadgeCount(0);
            return;
        }

        try {
            // ── 1. Fetch Java Service Inquiries (Traditional) ──
            const javaPromise = fetch(`${urls.javaApiUrl}/v1/service-inquiries/my?page=0&size=50&sort=createdAt,desc`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            }).then(res => res.ok ? res.json() : null);

            // ── 2. Fetch Python AI Chat Inquiries ──
            const pythonPromise = getAiChatForms().catch(() => null);

            const [javaData, pythonData] = await Promise.all([javaPromise, pythonPromise]);

            // Calculate Java unread count (status === 'NEW')
            const javaContent = Array.isArray(javaData?.content) ? javaData.content : [];
            const javaCount = javaContent.filter(item => item?.status === 'NEW').length;

            // Calculate Python AI count
            const pythonForms = Array.isArray(pythonData?.forms) ? pythonData.forms : [];
            const pythonCount = pythonForms.filter(item => item?.read === false).length;

            const totalCount = javaCount + pythonCount;

            // console.log('InquiryContext: Updating badge count to', totalCount, '(Java:', javaCount, ', AI:', pythonCount, ')');
            setBadgeCount(totalCount);
        } catch (error) {
            console.error('Failed to fetch inquiry counts', error);
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
            previousBadgeCountRef.current = null;
            initializedInquiryBaselineRef.current = false;
        }
        prevAuthRef.current = isAuthenticated;
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

            // Determine which tab to open
            if (event?.detail?.type === 'ai_service_request') {
                setTargetTab('ai-chat');
            } else {
                setTargetTab('contact-form');
            }

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
        const isFirstBadgeBaseline = previousBadgeCountRef.current === null;
        const previousBadgeCount = isFirstBadgeBaseline ? badgeCount : previousBadgeCountRef.current;
        const hasNewInquiry = !isFirstBadgeBaseline && badgeCount > previousBadgeCount;
        previousBadgeCountRef.current = badgeCount;

        if (isFirstBadgeBaseline && !initializedInquiryBaselineRef.current) {
            // Do not treat existing unread inquiries as new when a tab first opens.
            dismissedCountRef.current = badgeCount;
            initializedInquiryBaselineRef.current = true;
        }

        // Tear down any previous interval first
        if (soundIntervalRef.current) {
            clearInterval(soundIntervalRef.current);
            soundIntervalRef.current = null;
        }
        if (soundDelayTimeoutRef.current) {
            clearTimeout(soundDelayTimeoutRef.current);
            soundDelayTimeoutRef.current = null;
        }

        const onInquiryPage = location.pathname === '/service-contact-form'
            || location.pathname.startsWith('/service-inquiry-view/');
        if (badgeCount <= 0 || onInquiryPage || !inquiryEnabled || isFirstBadgeBaseline) return undefined;

        const delayMs = Math.max(0, inquiryDelay) * 1000;
        const frequencyMs = parseFrequencyMs(inquiryFrequency);

        if (inquiryFrequency === 'every') {
            if (hasNewInquiry) {
                soundDelayTimeoutRef.current = setTimeout(() => {
                    try { playInquirySound(); } catch (e) { /* ignore */ }
                }, delayMs);
            }
        } else {
            soundDelayTimeoutRef.current = setTimeout(() => {
                try { playInquirySound(); } catch (e) { /* ignore */ }

                if (frequencyMs) {
                    soundIntervalRef.current = setInterval(() => {
                        // Always use ref to get latest value — avoids stale closure
                        if (badgeCountRef.current <= 0
                            || window.location.pathname === '/service-contact-form'
                            || window.location.pathname.startsWith('/service-inquiry-view/')) {
                            clearInterval(soundIntervalRef.current);
                            soundIntervalRef.current = null;
                            return;
                        }
                        try { playInquirySound(); } catch (e) { /* ignore */ }
                    }, frequencyMs);
                }
            }, delayMs);
        }

        return () => {
            if (soundDelayTimeoutRef.current) {
                clearTimeout(soundDelayTimeoutRef.current);
                soundDelayTimeoutRef.current = null;
            }
            if (soundIntervalRef.current) {
                clearInterval(soundIntervalRef.current);
                soundIntervalRef.current = null;
            }
        };
    }, [badgeCount, location.pathname, inquiryEnabled, inquirySound, inquiryVolume, inquiryDelay, inquiryFrequency]);

    // ── Modal visibility ─────────────────────────────────────────────────────
    // Separate from sound so dismissing the modal doesn't stop the alert sound.
    useEffect(() => {
        const onInquiryPage = location.pathname === '/service-contact-form'
            || location.pathname.startsWith('/service-inquiry-view/');
        if (!inquiryEnabled || !inquiryShowModal || badgeCount <= 0 || onInquiryPage || badgeCount <= dismissedCountRef.current) {
            setShowInquiryModal(false);
            return;
        }
        setShowInquiryModal(true);
    }, [badgeCount, location.pathname, inquiryEnabled, inquiryShowModal]);

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
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>
                        {targetTab === 'ai-chat' ? 'New AI Inquiry' : 'New Service Inquiry'}
                    </div>
                    <div style={{ fontSize: 16, color: '#bfdbfe' }}>
                        <strong style={{ color: '#ffffff' }}>{lastInquiryName || 'A customer'}</strong> {targetTab === 'ai-chat' ? 'has submitted a new AI inquiry' : 'has submitted a new service inquiry'}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <Button
                            type="primary"
                            size="large"
                            style={{ borderRadius: 8, paddingInline: 28, background: '#ffffff', borderColor: '#ffffff', color: '#1d4ed8', fontWeight: 600 }}
                            onClick={() => {
                                dismissedCountRef.current = badgeCount;
                                setShowInquiryModal(false);
                                navigate('/service-contact-form', { state: { activeTab: targetTab } });
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
