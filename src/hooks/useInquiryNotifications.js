import { useEffect } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { App } from 'antd';
import { getValidToken } from '../api/getValidToken';
import urls from '../config';

const useInquiryNotifications = () => {
    const { notification } = App.useApp();

    useEffect(() => {
        const token = getValidToken();
        if (!token) return;

        console.log('Initializing SSE connection for inquiry notifications...');

        const eventSource = new EventSourcePolyfill(`${urls.javaApiUrl}/v1/notifications/inquiries/stream`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            heartbeatTimeout: 120000,
        });

        eventSource.onopen = () => {
            console.log('SSE connection opened.');
        };

        eventSource.onmessage = (event) => {
            console.log('Received SSE keep-alive/message:', event.data);
        };

        eventSource.addEventListener('NEW_INQUIRY', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('New Inquiry Received:', data);

                notification.info({
                    message: `New Inquiry from ${data.firstName} ${data.lastName}`,
                    description: `Vehicle: ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}`,
                    duration: 5,
                    placement: 'topRight',
                    onClick: () => {
                        window.location.href = '/service-contact-form';
                    }
                });
            } catch (error) {
                console.error('Error parsing SSE event data:', error);
            }
        });

        eventSource.onerror = (error) => {
            // console.error('SSE connection error:', error);
            // Polyfill handles reconnection logic, but we can log errors.
            // If 401, maybe token expired?
            if (error?.status === 401) {
                // console.log("SSE Authentication failed.");
                eventSource.close();
            }
        };

        return () => {
            console.log('Closing SSE connection.');
            eventSource.close();
        };
    }, [notification]);
};

export default useInquiryNotifications;
