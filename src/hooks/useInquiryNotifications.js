import { useEffect } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { App } from 'antd';
import { getValidToken } from '../api/getValidToken';
import urls from '../config';
import { playNotificationSound } from '../utils/playNotificationSound';

const useInquiryNotifications = (isAuthed) => {

    const { notification } = App.useApp();

    useEffect(() => {
        if (!isAuthed) return;
        let eventSource = null;
        let retryTimeout = null;
        const connect = () => {
            const token = getValidToken();
            if (!token) {
                retryTimeout = setTimeout(connect, 5000);
                return;
            }
            eventSource = new EventSourcePolyfill(`${urls.javaApiUrl}/v1/notifications/inquiries/stream`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                heartbeatTimeout: 120000,
            });
            eventSource.onopen = () => {};
            eventSource.onmessage = (_event) => {};
            eventSource.addEventListener('NEW_INQUIRY', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const customEvent = new CustomEvent('INQUIRY_RECEIVED', { detail: data });
                    window.dispatchEvent(customEvent);
                } catch {}
            });
            eventSource.onerror = (_error) => {
                eventSource.close();
                const retryTime = 10000;
                retryTimeout = setTimeout(connect, retryTime);
            };
        };
        connect();
        return () => {
            if (eventSource) {
                eventSource.close();
            }
            if (retryTimeout) {
                clearTimeout(retryTimeout);
            }
        };
    }, [notification, isAuthed]);
};

export default useInquiryNotifications;
