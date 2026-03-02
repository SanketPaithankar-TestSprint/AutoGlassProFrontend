import { useState, useEffect } from 'react';
import { getValidToken } from '../../../api/getValidToken';
import urls from '../../../config';

export const useSecureImage = (attachmentId) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!attachmentId) {
            setLoading(false);
            return;
        }

        let active = true;
        const fetchImage = async () => {
            try {
                const token = getValidToken();
                const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/attachments/${attachmentId}/download`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*'
                    }
                });

                if (response.ok && active) {
                    const blob = await response.blob();
                    const imageBlob = blob.type ? blob : new Blob([blob], { type: 'image/jpeg' });
                    const url = URL.createObjectURL(imageBlob);
                    setImageUrl(url);
                }
            } catch (err) {
                console.error("Error loading image:", err);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchImage();

        return () => {
            active = false;
            // Clean up the object URL to avoid memory leaks
            setImageUrl((prevUrl) => {
                if (prevUrl) {
                    URL.revokeObjectURL(prevUrl);
                }
                return null;
            });
        };
    }, [attachmentId]);

    return { imageUrl, loading };
};

export default useSecureImage;
