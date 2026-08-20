import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/jobs`;
import { api } from '../services/interceptor';

export const JobService = {
    getAllJobs: async () => {
        try {
            const response = await api.get(`${API_URL}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    cancelJob: async (jobId) => {
        console.log("Cancelling job with ID:", jobId);
        try {
            const response = await api.post(`${API_URL}/${jobId}/cancel`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}
