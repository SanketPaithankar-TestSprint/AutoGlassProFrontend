import axios from 'axios';
import urls from '../config';
import { getValidToken } from '../api/getValidToken';

const paymentService = {
    delete: async (id) => {
        try {
            const token = getValidToken();
            
            if (!token) {
                throw new Error('Authentication token not found. Please login.');
            }
            
            console.log('Attempting to delete payment with ID:', id);
            console.log('API URL:', `${urls.javaApiUrl}/v1/payments/${id}`);
            
            const response = await axios.delete(`${urls.javaApiUrl}/v1/payments/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Delete successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Payment delete error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            
            // Log the full response data
            console.error('Full error response data:', JSON.stringify(error.response?.data, null, 2));
            
            // Return detailed error message
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.error 
                || error.response?.data?.details
                || (typeof error.response?.data === 'string' ? error.response?.data : null)
                || error.response?.statusText 
                || error.message 
                || 'Failed to delete payment';
            
            throw new Error(errorMessage);
        }
    },
};

export default paymentService;
