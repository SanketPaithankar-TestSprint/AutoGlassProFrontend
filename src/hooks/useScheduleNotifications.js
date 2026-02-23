import { useEffect } from 'react';
import { App } from 'antd';
import dayjs from 'dayjs';
import { getServiceDocumentSchedule } from '../api/getServiceDocumentSchedule';
import { playNotificationSound } from '../utils/playNotificationSound';

/**
 * Hook that shows schedule notifications when a user logs in.
 * - Yellow notification for items scheduled today
 * - Green notification for items scheduled tomorrow
 * Fires once per browser session (sessionStorage guard).
 */
const useScheduleNotifications = (isAuthed) => {
    const { notification } = App.useApp();

    useEffect(() => {
        if (!isAuthed) return;

        // Only notify once per session
        if (sessionStorage.getItem('scheduleNotifyShown')) return;

        const fetchAndNotify = async () => {
            try {
                const docs = await getServiceDocumentSchedule({
                    days: 2,
                    startDate: dayjs().format('YYYY-MM-DD'),
                    includePast: false,
                });

                const today = dayjs();
                const tomorrow = today.add(1, 'day');

                const todayDocs = docs.filter(
                    (doc) => doc.scheduledDate && dayjs(doc.scheduledDate).isSame(today, 'day')
                );

                const tomorrowDocs = docs.filter(
                    (doc) => doc.scheduledDate && dayjs(doc.scheduledDate).isSame(tomorrow, 'day')
                );

                if (todayDocs.length === 0 && tomorrowDocs.length === 0) return;

                // Play sound once for any notification
                playNotificationSound();

                // ── Today → Yellow ──
                if (todayDocs.length > 0) {
                    const docList = todayDocs
                        .slice(0, 5)
                        .map((d) => d.documentNumber || 'N/A')
                        .join(', ');
                    const extra = todayDocs.length > 5 ? ` and ${todayDocs.length - 5} more` : '';

                    notification.warning({
                        message: `📅 ${todayDocs.length} Job${todayDocs.length > 1 ? 's' : ''} Scheduled Today`,
                        description: `${docList}${extra}`,
                        placement: 'topRight',
                        duration: 0, // persistent
                        style: {
                            background: '#fffbe6',
                            border: '1px solid #ffe58f',
                        },
                    });
                }

                // ── Tomorrow → Green ──
                if (tomorrowDocs.length > 0) {
                    const docList = tomorrowDocs
                        .slice(0, 5)
                        .map((d) => d.documentNumber || 'N/A')
                        .join(', ');
                    const extra = tomorrowDocs.length > 5 ? ` and ${tomorrowDocs.length - 5} more` : '';

                    notification.success({
                        message: `🗓️ ${tomorrowDocs.length} Job${tomorrowDocs.length > 1 ? 's' : ''} Scheduled Tomorrow`,
                        description: `${docList}${extra}`,
                        placement: 'topRight',
                        duration: 8, // auto-dismiss after 8s
                        style: {
                            background: '#f6ffed',
                            border: '1px solid #b7eb8f',
                        },
                    });
                }

                // Mark as shown for this session
                sessionStorage.setItem('scheduleNotifyShown', 'true');
            } catch (error) {
                console.error('Schedule notification fetch failed:', error);
            }
        };

        // Small delay to let the app settle after login
        const timer = setTimeout(fetchAndNotify, 1500);
        return () => clearTimeout(timer);
    }, [isAuthed, notification]);
};

export default useScheduleNotifications;
