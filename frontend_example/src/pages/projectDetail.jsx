import { useParams, useNavigate } from "react-router-dom";
import {
    Group, TextInput, Title, Stack, Text, Button, useMantineTheme, Textarea,
    Box, Flex,  useMantineColorScheme
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { ProjectService } from "../services/projectsService";
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useProjects } from '../contexts/projectsContext';
import { useMediaQuery } from '@mantine/hooks';

import { Icons } from '../icons';

const ProjectDetail = () => {
    const { projectID } = useParams();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    //const { updateProject, deleteProject } = useProjects();
    const [project, setProject] = useState(null);
    const [numberOfTestCases, setNumberOfTestCases] = useState(0);
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
    const { colorScheme } = useMantineColorScheme();

    const handleNewTestCase = () => {
        navigate(`/newtestCase/${projectID}`);
    }

    const fetchProject = async () => {
        try {
            setLoading(true);
            const response = await ProjectService.getProjectbyId(projectID);
            setProject(response.project);
            setNumberOfTestCases(response.numberOfTestCases);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [projectID]);

    const handleEdit = async (projectName, description) => {
        try {
            setLoading(true);
            const response = await ProjectService.updateProject(project.id, projectName, description);
            updateProject(response.project);
            setProject(response.project);
            setLoading(false);
        } catch (error) {
            console.error("Error saving project:", error);
            notifications.show({
                title: `Error`,
                message: `Error saving project: ${error.message}`,
                color: "red"
            });
            setLoading(false);
        }
    }

    const handleModalEdit = () => {
        let projectName = project?.projectName || "";
        let projectDescription = project?.description || "";

        modals.openConfirmModal({
            title: 'Edit Project',
            children: (
                <Stack>
                    <TextInput
                        label="Project Name"
                        placeholder="Enter project name"
                        required
                        defaultValue={projectName}
                        onChange={(event) => projectName = event.currentTarget.value}
                        error={!projectName.trim() ? "Project name cannot be empty" : null}
                    />
                    <Textarea
                        label="Description"
                        placeholder="Enter project description"
                        defaultValue={projectDescription}
                        onChange={(event) => projectDescription = event.currentTarget.value}
                    />
                </Stack>
            ),
            labels: { confirm: 'Save', cancel: 'Cancel' },
            confirmProps: { color: 'green', disabled: !projectName.trim() },
            onConfirm: () => {
                if (!projectName.trim()) {
                    notifications.show({
                        title: 'Error',
                        message: 'Project name cannot be empty. This change will not be saved.',
                        color: 'red',
                    });
                    return;
                }
                handleEdit(projectName, projectDescription);
            },
        });
    };


    const handleDelete = () => {
        modals.openConfirmModal({
            title: 'Delete Project',
            children: (
                <Text size="md">
                    Are you sure you want to delete <strong>"{project?.projectName}"</strong>?
                    <br/>
                    This action will delete all associated test cases and data.
                    <br/>
                    <strong>WARNING:</strong> This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => handleDeleteProject(project.id),
        });
    };

    const handleDeleteProject = async () => {
        try {
            const response = await ProjectService.deleteProject(projectID);

            notifications.show({
                title: `Success`,
                message: `Project deleted successfully.`,
            });
            deleteProject(Number(projectID));
            navigate("/homepage");
        } catch (error) {
            console.error("Error deleting project:", error);
            notifications.show({
                title: `Error`,
                message: `Error deleting project: ${error.message}`,
                color: "red"
            });
        }
    };


    return (
        <Box p={{ base: 'md', md: 'xl' }} pt={0} mx="auto" maw={1000}>
            <Title order={1} ta="center"  size={isMobile ? "h2" : "h1"}>PROJECT DETAILS</Title>
            {/* Encabezado con acciones */}
            <Flex justify="space-between" align="center" mb="xl" wrap="wrap" gap="md" mt="xl">
                <Box>
                    <Title order={2} fw={700} mb={4}>
                        {project?.projectName || 'Untitled Project'}
                    </Title>
                    <Text size="sm" c="dimmed">
                        ID: {project?.id || 'N/A'}
                    </Text>
                </Box>

                <Group gap="sm">
                    <Button
                        variant="outline"
                        leftSection={<Icons.Edit size={14} />}
                        // onClick={handleModalEdit}
                        size="sm"
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        color="red"
                        leftSection={<Icons.Delete size={14} />}
                        // onClick={handleDelete}
                        size="sm"
                    >
                        Delete
                    </Button>
                </Group>
            </Flex>

            {/* Panel de información principal */}
            <Box mb="xl">
                <Text fz="sm" fw={600} c="dimmed" mb="xs" tt="uppercase">
                    Project Description
                </Text>
                <Box
                    p="md"
                    bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'}
                    style={{ borderRadius: 8 }}
                >
                    <Text>
                        {project?.description || 'No description available'}
                    </Text>
                </Box>
            </Box>

            {/* Sección de acciones principales */}
            <Box
                p="md"
                bg={colorScheme === 'dark' ? 'dark.7' : 'white'}
                style={{
                    borderRadius: 8,
                    border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`
                }}
            >
                <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                    <Box>
                        <Text fz="sm" fw={600} c="dimmed" mb={4}>
                            Test Cases
                        </Text>
                        <Text fz="lg" fw={500}>
                            {numberOfTestCases|| 0} registered
                        </Text>
                    </Box>

                    <Button
                        leftSection={<Icons.Plus size={14} />}
                        // onClick={handleNewTestCase}
                        size="md"
                    >
                        Add New Test Case
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};
export default ProjectDetail;
