import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/project`;
import { api } from '../services/interceptor';
import projects_testcase from '../mock_data/project_testcase.json';

export const ProjectService = {
    getProjects: async () => {
        try {
            const response = await api.get(`${API_URL}/projects`);
            return response.data;
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    },
    getProjectsTestCases: async () => {
        return projects_testcase;
        // try {
        //     const response = await api.get(`${API_URL}/projects?includeTestCases=true`);
        //     return response.data;
        // } catch (error) {
        //     console.error("Error fetching projects:", error);
        //     throw error;
        // }
    },

    createProject: async (projectName, description) => {
        try {
            const response = await api.post(`${API_URL}/save`, {
                projectName,
                description
            });
            return response.data;
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },

    getTestCasesbyProjectId: async (projectID) => {
        try {
            const response = await api.get(`${API_URL}/${projectID}/testCases`);
            return response.data;
        } catch (error) {
            console.error("Error fetching testCases:", error);
            throw error;
        }
    },

    getProjectbyId: async (projectID) => {
        const id = Number(projectID);
        const project = projects_testcase.find(proj => proj.id === id);
        return {
            project,
            projectName: project?.projectName || '',
            numberOfTestCases: project?.TestCases?.length || 0
        };
        // try {
        //     const response = await api.get(`${API_URL}/${projectID}`);
        //     return response.data;
        // } catch (error) {
        //     console.error("Error fetching project by ID:", error);
        //     throw error;
        // }
    },

    updateProject: async (projectID, projectName, description) => {
        try {
            const response = await api.put(`${API_URL}/${projectID}`, {
                projectName,
                description
            });
            return response.data;
        } catch (error) {
            console.error("Error updating project:", error);
            throw error;
        }
    },
    deleteProject: async (projectID) => {
        try {
            const response = await api.delete(`${API_URL}/${projectID}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting project:", error);
            throw error;
        }
    },
};
