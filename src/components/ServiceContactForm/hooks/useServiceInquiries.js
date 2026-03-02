import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getValidToken } from '../../../api/getValidToken';
import urls from '../../../config';

export const useServiceInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const fetchInquiries = useCallback(async (page = 0, size = 20) => {
        setLoading(true);
        try {
            const token = getValidToken();
            const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/my?page=${page}&size=${size}&sort=createdAt,desc`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const safeData = data.content || [];
                setInquiries(safeData);
                setTotal(data.totalElements || safeData.length);
            } else {
                console.error("Failed to fetch inquiries");
            }
        } catch (error) {
            console.error("Error fetching inquiries:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteInquiry = async (id) => {
        try {
            const token = getValidToken();
            const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (response.ok) {
                message.success('Inquiry deleted successfully');
                // Optimistically remove from list
                setInquiries(prev => prev.filter(req => req.id !== id));
                setTotal(prev => prev - 1);

                // Dispatch event to notify sidebar to refresh badge count
                window.dispatchEvent(new CustomEvent('INQUIRY_STATUS_CHANGED'));
                return true;
            } else {
                message.error('Failed to delete inquiry');
                return false;
            }
        } catch (error) {
            console.error("Error deleting inquiry:", error);
            message.error('An error occurred while deleting');
            return false;
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = getValidToken();
            const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/${id}/status?status=READ`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (response.ok) {
                // Update local state
                setInquiries(prev => prev.map(item =>
                    item.id === id ? { ...item, status: 'READ' } : item
                ));
                // Dispatch event to notify sidebar to refresh badge count
                window.dispatchEvent(new CustomEvent('INQUIRY_STATUS_CHANGED'));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to update status", error);
            return false;
        }
    };

    return { inquiries, loading, total, fetchInquiries, deleteInquiry, markAsRead };
};

export default useServiceInquiries;
