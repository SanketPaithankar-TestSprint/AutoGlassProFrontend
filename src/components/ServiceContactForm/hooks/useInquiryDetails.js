import { useState, useEffect } from 'react';
import { getValidToken } from '../../../api/getValidToken';
import urls from '../../../config';

export const useInquiryDetails = (inquiryId) => {
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInquiry = async () => {
            if (!inquiryId) return;
            setLoading(true);
            setError(null);
            try {
                const token = getValidToken();
                const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/${inquiryId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setInquiry(data);
                } else {
                    setError('Failed to fetch inquiry details');
                }
            } catch (err) {
                setError('An error occurred while fetching details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInquiry();
    }, [inquiryId]);

    return { inquiry, loading, error };
};

export default useInquiryDetails;
