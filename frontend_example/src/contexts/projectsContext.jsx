import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectService } from '../services/projectsService';
import { StorageService } from '../services/storageService';

const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const storage = new StorageService();
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await ProjectService.getProjectsTestCases();
            setProjects([...response]);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };
    const selectProject = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        setSelectedProject(project);
    };
    const updateProject = (updated) => {
        setProjects(prev =>
            prev.map(p =>
                p.id === updated.id
                    ? { ...p, ...updated, TestCases: updated.TestCases ?? p.TestCases }
                    : p
            )
        );
    };

    useEffect(() => {
        const token = storage.getItem('token');
        const isAdmin = storage.getItem('isAdmin');
        if (token && !isAdmin) {
            fetchProjects();
        }
    }, []);


    const addProject = (newProject) => {
        setProjects((prev) => [...prev, newProject]);
    };

    const deleteProject = (projectId) => {
        setProjects((prev) => prev.filter((project) => project.id !== projectId));
    };


    const addTestCase = (projectId, newExp) => {
        setProjects(prev =>
            prev.map(p =>
                p.id === projectId
                    ? { ...p, TestCases: [...(p.TestCases || []), newExp] }
                    : p
            )
        );
    };

    const deleteTestCase = (projectId, testCaseId) => {
        setProjects(prev =>
            prev.map(project => {
                if (Number(project.id) !== Number(projectId)) return project;

                return {
                    ...project,
                    TestCases: (project.TestCases || []).filter(e => Number(e.id) !== Number(testCaseId)),
                };
            })
        );
    };

    const update_TestCase = (projectId, updated) => {
        setProjects(prev =>
            prev.map(project => {
                if (Number(project.id) !== Number(projectId)) return project;

                return {
                    ...project,
                    TestCases: (project.TestCases || []).map(e => (Number(e.id) === Number(updated.id) ? updated : e)),
                };
            })
        );
    }

    return (
        <ProjectsContext.Provider value={{
            projects, setProjects, fetchProjects, loading, addProject, selectedProject, selectProject, updateProject, addTestCase, deleteProject, deleteTestCase, update_TestCase,
        }}>
            {children}
        </ProjectsContext.Provider>
    );
};

// Custom hook para usar el contexto
export const useProjects = () => {
    return useContext(ProjectsContext);
};
