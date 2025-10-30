import axios from 'axios';
import authService from '../services/authService';


const API_BASE_URL = 'http://localhost:8080/api/auth';

const authService = {
    register: async (userData) =>
    {
        try
        {
            const response = await axios.post(`${API_BASE_URL}/register`, userData);
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
