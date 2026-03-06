import { useEffect } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { getValidToken } from '../api/getValidToken';
import urls from '../config';

const useInquiryNotifications = (isAuthed) => {

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
                retryTimeout = setTimeout(connect, 10000);
            };
        };
        connect();
        return () => {
            if (eventSource) eventSource.close();
            if (retryTimeout) clearTimeout(retryTimeout);
        };
    }, [isAuthed]); // removed `notification` — it was unused and caused reconnects on every render
};

export default useInquiryNotifications;
