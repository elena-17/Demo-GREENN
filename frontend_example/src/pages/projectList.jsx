import { useEffect, useState } from "react";
import ExpandedTestCase from "../components/expanded-testCase";
import { useProjects } from '../contexts/projectsContext';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Icons } from '../icons';
import { FileService } from "../services/fileService";

import {
    Button, Loader, Text, Group, ActionIcon,
    Stack, Flex, Box, Title, TextInput, Textarea, useMantineTheme, useComputedColorScheme

} from "@mantine/core";
import { modals } from '@mantine/modals';
import DataTable from "react-data-table-component";
import { ProjectService } from "../services/projectsService";

const ProjectList = () => {

    const { projects, loading, fetchProjects, updateProject, deleteProject, addProject } = useProjects();
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const isDark = computedColorScheme === 'dark';

    useEffect(() => {
        fetchProjects();
    }, []);


        const handleCreateProject = () => {
            let projectName = "";
            let projectDescription = "";

            modals.openConfirmModal({
                title: 'Create Project',
                children: (
                    <Stack>
                        <TextInput
                            label="Project Name"
                            placeholder="Enter project name"
                            required
                            onChange={(event) => projectName = event.currentTarget.value}
                        />
                        <Textarea
                            label="Description"
                            placeholder="Enter project description"
                            onChange={(event) => projectDescription = event.currentTarget.value}
                        />
                    </Stack>
                ),
                labels: { confirm: 'Create', cancel: 'Cancel' },
                confirmProps: { color: 'green' },
                onConfirm: () => {
                    if (!projectName.trim()) {
                        notifications.show({
                            title: 'Error',
                            message: 'Project name cannot be empty',
                            color: 'red',
                        });
                        return;
                    }
                    handleAddProject(projectName, projectDescription);
                },
            });
        };

        const handleAddProject = async (projectName, projectDescription) => {
            try {
                const data = await ProjectService.createProject(projectName, projectDescription);

                const newP = data.project;

                addProject(newP);

            } catch (error) {
                console.error("Error saving the project:", error);
                notifications.show({
                    title: 'Error',
                    message: 'Error saving the project',
                    color: 'red',
                });
            }
        };


    const customStyles = {
        table: {
            style: {
                fontFamily: 'var(--mantine-font-family)',
            },
        },
        headRow: {
            style: {
                backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[1],
                fontSize: theme.fontSizes.sm,
                fontWeight: 600,
            },
        },
        headCells: {
            style: {
                color: isDark ? theme.colors.gray[3] : theme.colors.dark[7],
            },
        },
        rows: {
            style: {
                backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
                color: isDark ? theme.colors.gray[3] : theme.colors.dark[7],
                '&:not(:last-of-type)': {
                    borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
                },
            },
            highlightOnHoverStyle: {
                backgroundColor: isDark ? theme.colors.dark[5] : theme.colors.gray[0],
            },
        },
        expanderRow: {
            style: {
                backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
            },
        },
        cells: {
            style: {
                fontSize: theme.fontSizes.sm,
            },
        },
        pagination: {
            style: {
                color: isDark ? theme.colors.gray[5] : theme.colors.gray[7],
                backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
                borderTop: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
            },
            pageButtonsStyle: {
                color: isDark ? theme.colors.gray[3] : theme.colors.dark[7],
                '&:disabled': {
                    color: isDark ? theme.colors.dark[3] : theme.colors.gray[5],
                },
            },
        },
        noData: {
            style: {
                backgroundColor: 'transparent',
            },
        },
    }

    const handleDeleteProject = async (projectID) => {
        try {
            const response = await ProjectService.deleteProject(projectID);

            notifications.show({
                title: `Success`,
                message: `Project deleted successfully.`,
            });
            deleteProject(Number(projectID));
        } catch (error) {
            console.error("Error deleting project:", error);
            notifications.show({
                title: `Error`,
                message: `Error deleting project: ${error.message}`,
                color: "red"
            });
        }
    };


    const handleDelete = (project) => {
        modals.openConfirmModal({
            title: 'Delete Project',
            children: (
                <Text size="md" style={{ wordWrap: 'break-word' }}>
                    Are you sure you want to delete <strong>"{project?.projectName}"</strong>?
                    <br />
                    This action will delete all associated test cases and data.
                    <br />
                    <strong>WARNING:</strong> This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => handleDeleteProject(project.id),
        });
    };



    const handleEditProject = async (projectID, projectName, description) => {
        try {
            const response = await ProjectService.updateProject(projectID, projectName, description);
            updateProject(response.project);
        } catch (error) {
            console.error("Error saving project:", error);
            notifications.show({
                title: `Error`,
                message: `Error saving project: ${error.message}`,
                color: "red"
            });
        }
    }

    const handleEdit = (project) => {
        console.log(project);
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
                handleEditProject(project.id, projectName, projectDescription);
            },
        });
    };


    const handleDownloadProject = async (project) => {
        if (!project.filePath) {
            notifications.show({
                title: 'Error',
                message: 'Project folder not found.',
                color: 'red',
            });
            return;
        }
        if (project.TestCases.length === 0) {
            notifications.show({
                title: 'Error',
                message: 'No test cases found for this project. Cannot download.',
                color: 'red',
            });
            return;
        }
        try {
            const filePath = project.filePath;
            const response = await FileService.downloadProject(filePath);
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${project.projectName}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: `Failed to download project: ${error.message}`,
                color: 'red',
            });
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const filteredProjects = projects.filter(project =>
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box p={{ base: 'md', md: 'xl' }} pt={0} mx="auto" maw={1000} >
            <Title order={1} ta="center" size={isMobile ? "h2" : "h1"} mb="xl" >
                PROJECT MANAGEMENT
            </Title>
            <Group justify="space-between" mb="md" align="center">
                <TextInput
                    placeholder="Search by project name..."
                    leftSection={<Icons.Search size={16} />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    w="50%"
                />
                <Button
                    w="25%"
                    variant="outline"
                    leftSection={<Icons.FolderPlus />}
                    onClick={handleCreateProject}>
                    Create Project
                </Button>
            </Group>

            <DataTable
                title=""
                data={filteredProjects}
                defaultSortField="createdAt"
                pagination
                highlightOnHover
                responsive
                persistTableHead
                theme={isDark ? "dark" : "default"}
                noDataComponent={
                    <Flex justify="center" align="center" direction="column" p="50" gap="sm">
                        <Text align="center">No projects found</Text>
                    </Flex>}
                progressPending={loading}
                customStyles={customStyles}
                progressComponent={
                    <Flex justify="center" align="center" direction="column" p="50" gap="sm">
                        <Text align="center">Loading...</Text>
                        <Loader />
                    </Flex>
                }
                expandableRows
                expandableRowsComponent={({ data }) => (
                    <ExpandedTestCase projectID={data.id} testCases={data.TestCases || []} />
                )}
                columns={[
                    {
                        name: 'Project Name',
                        sortable: true,
                        wrap: true,
                        selector: (project) => project.projectName || '-',
                    },
                    {
                        name: 'Description',
                        sortable: false,
                        wrap: true,
                        selector: (project) => project.description || '-',
                    },
                    {
                        name: 'Created At',
                        sortable: true,
                        selector: (project) =>
                            project.createdAt
                                ? new Date(project.createdAt).toLocaleDateString()
                                : '-',
                    },
                    {
                        name: 'Actions',
                        selector: (project) => (
                            <Group gap="xs" wrap="nowrap">
                                <ActionIcon
                                    title="Download Project"
                                    variant="subtle"
                                    // onClick={() => handleDownloadProject(project)}
                                >
                                    <Icons.Download />
                                </ActionIcon>
                                <ActionIcon
                                    title="Edit TestCase"
                                    variant="subtle"
                                    // onClick={() => handleEdit(project)}
                                >
                                    <Icons.Edit />
                                </ActionIcon>
                                <ActionIcon variant="subtle" 
                                // onClick={() => handleDelete(project)} 
                                title="Delete" color="red">
                                    <Icons.Delete />
                                </ActionIcon>
                            </Group>
                        ),
                    },
                ]}
            />
        </Box >
    );
};

export default ProjectList;
