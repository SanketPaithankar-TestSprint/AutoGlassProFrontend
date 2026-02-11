import { useEffect } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { App } from 'antd';
import { getValidToken } from '../api/getValidToken';
import urls from '../config';
import { playNotificationSound } from '../utils/playNotificationSound';

const useInquiryNotifications = () => {
    const { notification } = App.useApp();

    useEffect(() => {
        let eventSource = null;
        let retryTimeout = null;

        const connect = () => {
            const token = getValidToken();
            if (!token) {
                console.warn('No valid token found for SSE. Retrying in 5s...');
                retryTimeout = setTimeout(connect, 5000);
                return;
            }

            console.log('Initializing SSE connection for inquiry notifications...');

            eventSource = new EventSourcePolyfill(`${urls.javaApiUrl}/v1/notifications/inquiries/stream`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                heartbeatTimeout: 120000,
            });

            eventSource.onopen = () => {
                console.log('SSE connection opened.');
            };

            eventSource.onmessage = (event) => {
                // Heartbeat or keep-alive
                // console.log('Received SSE keep-alive/message:', event.data);
            };



            eventSource.addEventListener('NEW_INQUIRY', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('✅ New Inquiry Received:', data);

                    // Play chime
                    playNotificationSound();

                    notification.info({
                        message: `New Inquiry from ${data.firstName} ${data.lastName}`,
                        description: `Vehicle: ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}`,
                        duration: 0, // Persistent until closed
                        placement: 'topRight',
                        onClick: () => {
                            window.location.href = '/service-contact-form';
                        },
                        style: { cursor: 'pointer' }
                    });

                    // Dispatch custom event for components to refresh data
                    console.log('🔔 Dispatching INQUIRY_RECEIVED event...');
                    const customEvent = new CustomEvent('INQUIRY_RECEIVED', { detail: data });
                    window.dispatchEvent(customEvent);
                    console.log('✅ INQUIRY_RECEIVED event dispatched');
                } catch (error) {
                    console.error('❌ Error parsing SSE event data:', error);
                }
            });

            eventSource.onerror = (error) => {
                console.error('SSE connection error:', error);

                // Close current connection
                eventSource.close();

                // If 401, token might be expired. Retry allows picking up a new token if available.
                // If standard network error, browser might handle, but polyfill might need help for full disconnects.
                // We'll retry with a backoff.
                const retryTime = (error?.status === 401) ? 5000 : 3000;
                console.log(`Retrying SSE in ${retryTime}ms...`);
                retryTimeout = setTimeout(connect, retryTime);
            };
        };

        connect();

        return () => {
            console.log('Closing SSE connection and cleanup.');
            if (eventSource) {
                eventSource.close();
            }
            if (retryTimeout) {
                clearTimeout(retryTimeout);
            }
        };
    }, [notification]);
};

export default useInquiryNotifications;
