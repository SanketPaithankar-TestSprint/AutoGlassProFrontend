import axios from 'axios';
import authService from '../services/authService';


const API_BASE_URL = 'http://localhost:8080/api/v1/payments/{paymentId}';
const paymentService = {
    delete: async (id) =>
    {
        try
        {
            const response = await axios.delete(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error)
        {
            throw error.response?.data || error.message;
        }
    },

    login: async (credentials) =>
    {
        try
        {
            const response = await axios.post(`${API_BASE_URL}/login`, credentials);
            return response.data;
        } catch (error)
        {
            throw error.response?.data || error.message;
        }
    }
};

export default authService;
