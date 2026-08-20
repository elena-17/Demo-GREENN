import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/admin`;
import { api } from '../services/interceptor';

export const AdminService = {
    getUsers: async () => {
        try {
            const response = await api.get(`${API_URL}/users`);
            return response.data;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    },

    deleteUser: async (email) => {
        try {
            const response = await api.delete(`${API_URL}/users/${email}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    },

    updateUser: async (email, role) => {
        try {
            const response = await api.put(`${API_URL}/users/${email}`, { role });
            return response.data;
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    },

    updatePassword: async (email,  newPassword) => {
        try {
            const response = await api.put(`${API_URL}/users/${email}/password`, { newPassword });
            return response.data;
        } catch (error) {
            console.error("Error updating password:", error);
            throw error;
        }
    },
    getDatasets: async (email) => {
        try {
            const response = await api.get(`${API_BASE_URL}/admin/datasets`, {
                params: { email }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching datasets:", error);
            throw error;
        }
    },

    deleteDataset: async (datasetId) => {
        try {
            const response = await api.delete(`${API_BASE_URL}/admin/datasets/${datasetId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting dataset:", error);
            throw error;
        }
    },

    getProjects: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/admin/projects`);
            return response.data;
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    },
};
