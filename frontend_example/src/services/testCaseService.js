import { data } from 'react-router-dom';
import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/testCases`;
import { api } from './interceptor';
import projects_testcase from '../mock_data/project_testcase.json';
import dataset from '../mock_data/dataset.json';

export const TestCaseService = {
    createTestCase: async (testCaseConfig, modelConfig, trainerConfig, measurerConfig, projectID, datasetID) => {
        const layers = TestCaseService.cleanLayers(modelConfig.layers);
        modelConfig.layers = layers;
        const configToSave = {
            model: modelConfig,
            trainer: trainerConfig,
            measurer: measurerConfig,
        };
        try {
            const response = await api.post(`${API_URL}/save`, {
                name: testCaseConfig.name,
                projectId: projectID,
                metrics: testCaseConfig.metrics,
                parameters: configToSave,
                datasetId: datasetID,
                description: testCaseConfig.description,
            });
            return response.data;
        } catch (error) {
            console.error("Error saving testCase:", error);
            throw error;
        }
    },

    getTestCaseById: async (testCaseID) => {
        const testID = Number(testCaseID);
        const project = projects_testcase[0];
        const testCase = project.TestCases.find(tc => tc.id === testID);
        testCase.EMProject = project;
        testCase.Dataset = dataset;
        return testCase;
        // try {
        //     const response = await api.get(`${API_URL}/${testCaseID}`);
        //     return response.data;
        // } catch (error) {
        //     console.error("Error fetching testCase:", error);
        //     throw error;
        // }
    },

    deleteTestCase: async (testCaseID) => {
        try {
            const response = await api.delete(`${API_URL}/${testCaseID}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting testCase:", error);
            throw error;
        }
    },

    launch: async (testCaseID) => {
        try {
            const response = await api.post(`${API_URL}/${testCaseID}/launch`);
            return response.data;
        } catch (error) {
            console.error("Error launching testCase:", error);
            throw error;
        }
    },

    cancel: async (testCaseID) => {
        try {
            const response = await api.post(`${API_URL}/${testCaseID}/cancel`);
            return response.data;
        } catch (error) {
            console.error("Error canceling testCase:", error);
            throw error;
        }
    },

    updateStatus: async (testCaseID, status) => {
        try {
            const response = await api.patch(`${API_URL}/${testCaseID}/status`, { status });
            return response.data;
        } catch (error) {
            console.error("Error updating testCase status:", error);
            throw error;
        }
    },

    getErrorLog: async (testCaseID) => {
        return "Mock error log: Something went wrong during execution.";
        // try {
        //     const response = await api.get(`${API_URL}/${testCaseID}/error`);
        //     return response.data;
        // } catch (error) {
        //     console.error("Error fetching error log:", error);
        //     throw error;
        // }
    },

    duplicateTestCase: async (testCaseID) => {
        try {
            const response = await api.post(`${API_URL}/${testCaseID}/duplicate`);
            return response.data;
        } catch (error) {
            console.error("Error duplicating testCase:", error);
            throw error;
        }
    },

    updateTestCase: async (testCaseID, testCaseConfig, modelConfig, trainerConfig, measurerConfig, datasetID) => {
        const layers = TestCaseService.cleanLayers(modelConfig.layers);
        modelConfig.layers = layers;
        const configToSave = {
            model: modelConfig,
            trainer: trainerConfig,
            measurer: measurerConfig,
        };
        try {
            const response = await api.put(`${API_URL}/${testCaseID}/edit`, {
                name: testCaseConfig.name,
                metrics: testCaseConfig.metrics,
                parameters: configToSave,
                datasetId: datasetID,
            });
            return response.data;
        } catch (error) {
            console.error("Error editing testCase:", error);
            throw error;
        }
    },

    updateDescription: async (testCaseID, description) => {
        try {
            const response = await api.patch(`${API_URL}/${testCaseID}`, { description: description });
            return response.data;
        }
        catch (error) {
            console.error("Error updating testCase description:", error);
            throw error;
        }
    },

    downloadConfig: async (testCaseID) => {
        try {
            const response = await api.get(`${API_URL}/${testCaseID}/config/download`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error("Error downloading testCase config:", error);
            throw error;
        }
    },

    ///AUX
    cleanLayers: (layers) => {
        return layers.map(layer => {
            if (layer.type === 'dense') {
                const cleanedLayer = { ...layer };
                delete cleanedLayer.kernel_size;
                delete cleanedLayer.flatten;
                return cleanedLayer;
            }
            return layer;
        });
    },
};
