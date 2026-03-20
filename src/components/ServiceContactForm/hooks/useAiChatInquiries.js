import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getAiChatForms } from '../../../api/getAiChatForms';
import { markAiChatFormRead } from '../../../api/markAiChatFormRead';

const useAiChatInquiries = () => {
    const [forms, setForms] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchForms = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAiChatForms();
            setForms(data.forms || []);
            setCount(data.count || 0);
        } catch (error) {
            console.error('Error fetching AI chat forms:', error);
            message.error('Failed to load AI chat inquiries');
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = async (sessionId) => {
        try {
            await markAiChatFormRead(sessionId, true);
            setForms(prev => prev.map(f => f.session_id === sessionId ? { ...f, read: true } : f));
            window.dispatchEvent(new Event('INQUIRY_STATUS_CHANGED'));
        } catch (error) {
            console.error('Error marking AI chat form as read:', error);
            message.error('Failed to mark inquiry as read');
        }
    };

    return { forms, count, loading, fetchForms, markAsRead };
};

export default useAiChatInquiries;
