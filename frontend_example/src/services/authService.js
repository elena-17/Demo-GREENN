import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/auth`;
import axios from 'axios';

export const AuthService = {
    register: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                email,
                password,
            });
            return response.data;
        } catch (error) {
            console.error("Error during registration:", error);
            throw error;
        }
    },
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });
            return response.data;
        } catch (error) {
            console.error("Error during login:", error);
            throw error;
        }
    },
};
