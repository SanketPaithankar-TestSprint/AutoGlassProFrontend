import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { App } from 'antd';
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
    const [badgeCount, setBadgeCount] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [lastInquiryName, setLastInquiryName] = useState(null);
    const prevAuthRef = useRef(false);

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

            console.log('InquiryContext: Updating badge count to', count);
            setBadgeCount(count);
        } catch (error) {
            console.error('Failed to fetch inquiry count', error);
        }
    };

    // Trigger refresh
    const triggerRefresh = () => {
        console.log('🔄 InquiryContext: Refresh triggered, current trigger:', refreshTrigger);
        setRefreshTrigger(prev => {
            const newValue = prev + 1;
            console.log('🔄 InquiryContext: Setting refresh trigger to:', newValue);
            return newValue;
        });
    };

    // Fetch on mount and when refresh is triggered
    useEffect(() => {
        console.log('🔍 InquiryContext: Fetching inquiry count (trigger:', refreshTrigger, ')');
        fetchInquiryCount();
    }, [refreshTrigger]);

    // Re-fetch when authentication state changes (e.g. user logs in)
    useEffect(() => {
        if (isAuthenticated && !prevAuthRef.current) {
            // just logged in — fetch fresh count
            fetchInquiryCount();
        }
        if (!isAuthenticated && prevAuthRef.current) {
            // logged out — clear everything
            setBadgeCount(0);
            notification.destroy('service-inquiry-toast');
        }
        prevAuthRef.current = isAuthenticated;
    }, [isAuthenticated]);

    // Listen to inquiry events
    useEffect(() => {
        console.log('📡 InquiryContext: Setting up event listeners...');

        const handleInquiryReceived = (event) => {
            console.log('🔔 InquiryContext: INQUIRY_RECEIVED event detected', event.detail);
            const name = event?.detail?.visitorName
                || event?.detail?.firstName
                || event?.detail?.name
                || 'Customer';
            setLastInquiryName(name);
            triggerRefresh();
        };

        const handleInquiryStatusChanged = (event) => {
            console.log('🔔 InquiryContext: INQUIRY_STATUS_CHANGED event detected');
            triggerRefresh();
        };

        window.addEventListener('INQUIRY_RECEIVED', handleInquiryReceived);
        window.addEventListener('INQUIRY_STATUS_CHANGED', handleInquiryStatusChanged);

        console.log('✅ InquiryContext: Event listeners registered');

        return () => {
            console.log('🔌 InquiryContext: Removing event listeners');
            window.removeEventListener('INQUIRY_RECEIVED', handleInquiryReceived);
            window.removeEventListener('INQUIRY_STATUS_CHANGED', handleInquiryStatusChanged);
        };
    }, []);

    const value = {
        badgeCount,
        triggerRefresh,
        fetchInquiryCount,
    };

    // Play inquiry toast + sound based on badge count (same basis as red dot)
    // Don't show toast if the user is already viewing the service inquiry page
    useEffect(() => {
        const onInquiryPage = window.location.pathname === '/service-contact-form';

        if (badgeCount <= 0 || onInquiryPage) {
            notification.destroy('service-inquiry-toast');
            return undefined;
        }

        const name = lastInquiryName || 'Customer';
        notification.info({
            key: 'service-inquiry-toast',
            message: 'Service Inquiry',
            description: `New service from ${name}`,
            placement: 'topRight',
            duration: 0,
            onClick: () => {
                window.location.href = '/service-contact-form';
            },
            style: { cursor: 'pointer' }
        });

        const intervalId = setInterval(() => {
            try {
                playNotificationSound();
            } catch (e) { /* ignore */ }
        }, 10000);

        return () => {
            clearInterval(intervalId);
        };
    }, [badgeCount, lastInquiryName, notification]);

    return (
        <InquiryContext.Provider value={value}>
            {children}
        </InquiryContext.Provider>
    );
};
