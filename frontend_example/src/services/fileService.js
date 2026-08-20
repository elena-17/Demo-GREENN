import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/files`;
import { api } from '../services/interceptor';

export const FileService = {
    downloadProject: async (filePath) => {
        try {
            const response = await api.get(`${API_URL}/download/${encodeURIComponent(filePath.split('/').pop())}`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error("Error downloading project:", error);
            throw error;
        }
    },
    uploadDataset: async (formData, signal, onUploadProgress) => {
        try {
            const response = await api.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                signal,
                onUploadProgress
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
