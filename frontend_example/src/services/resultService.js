import { API_BASE_URL } from '../config';
import { api } from '../services/interceptor';
const API_URL = `${API_BASE_URL}/testCases`;
import report from '../mock_data/report.json';

export const ResultService = {
    getResults: async (testCaseID) => {
        return report;
        // try {
        //     const response = await api.get(`${API_URL}/${testCaseID}/results`);
        //     return response.data;
        // } catch (error) {
        //     console.error("Error fetching results:", error);
        //     throw error;
        // }
    },
    getTrainingResults: async (testCaseID) => {
        const response = await ResultService.getResults(testCaseID);
        return response["training_data"];
    },

    downloadTrainingResults: async (testCaseID) => {
        try {
            const response = await api.get(`${API_URL}/${testCaseID}/results/training/download`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error("Error downloading training results:", error);
            throw error;
        }
    },
    downloadResults: async (testCaseID) => {
        try {
            const response = await api.get(`${API_URL}/${testCaseID}/results/download`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error("Error downloading results:", error);
            throw error;
        }
    },
};
