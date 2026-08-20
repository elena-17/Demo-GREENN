import axios from 'axios';
import { API_BASE_URL } from "../config";
import { StorageService } from './storageService';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const storage = new StorageService();

async function refreshToken() {
    const refreshToken = storage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/auth/token-refresh`, { refreshToken });
        const { token } = response.data;
        storage.setItem('token', token);
        return token;
    } catch (error) {
        console.error('Failed to refresh access token:', error.message);
        throw new Error('Failed to refresh access token');
    }

}

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = storage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshToken();

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest); 
            } catch (refreshError) {
                console.warn("Refresh token expired or invalid. Logging out...");
                storage.clear();
                storage.setItem('sessionExpired', 'true');
                window.location.href = "/";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
