import React, { createContext, useContext, useState, useEffect } from 'react';
import { getValidToken } from '../api/getValidToken';
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
    const [badgeCount, setBadgeCount] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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

    // Listen to inquiry events
    useEffect(() => {
        console.log('📡 InquiryContext: Setting up event listeners...');

        const handleInquiryReceived = (event) => {
            console.log('🔔 InquiryContext: INQUIRY_RECEIVED event detected', event.detail);
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
        triggerRefresh
    };

    return (
        <InquiryContext.Provider value={value}>
            {children}
        </InquiryContext.Provider>
    );
};
