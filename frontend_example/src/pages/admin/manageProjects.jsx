import { useEffect, useState } from "react";
import ExpandedTestCase from "../../components/expanded-testCase";
import { notifications } from '@mantine/notifications';
import { Icons } from '../../icons';
import { FileService } from "../../services/fileService";
import { AdminService } from "../../services/adminService";
import { DatePickerInput } from '@mantine/dates';

import {
    Button, Loader, Text, Group, ActionIcon, Paper, Collapse, SimpleGrid,
    Flex, Box, Title, TextInput, useMantineTheme, useComputedColorScheme

} from "@mantine/core";
import { modals } from '@mantine/modals';
import DataTable from "react-data-table-component";
import { ProjectService } from "../../services/projectsService";
import { customDataTableStyles } from "../../styles/customDataTableStyle";


const ManageProjects = () => {

    const theme = useMantineTheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const isDark = computedColorScheme === 'dark';

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openedFilters, setOpenedFilters] = useState(false);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getProjects();
            setProjects(response);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching projects:", error);
            notifications.show({
                title: 'Error',
                message: `Error fetching projects: ${error.message}`,
                color: "red"
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);


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
            notifications.show({
                title: 'Success',
                message: 'Project downloaded successfully.',
                color: 'green',
            });
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: `Failed to download project: ${error.message}`,
                color: 'red',
            });
        }
    };

    const [projectNameFilter, setProjectNameFilter] = useState("");
    const [ownerFilter, setOwnerFilter] = useState("");
    const [createdAtBefore, setCreatedAtBefore] = useState(null);
    const [createdAtAfter, setCreatedAtAfter] = useState(null);


    const resetFilters = () => {
        setProjectNameFilter("");
        setOwnerFilter("");
        setCreatedAtBefore(null);
        setCreatedAtAfter(null);
    }

    const filteredProjects = projects.filter((project) => {
        const matchesProjectName = project.projectName.toLowerCase().includes(projectNameFilter.toLowerCase());
        const matchesOwner = project.userEmail ? project.userEmail.toLowerCase().includes(ownerFilter.toLowerCase()) : true;
        const matchesCreatedAtBefore = createdAtBefore ? new Date(project.createdAt) <= new Date(createdAtBefore) : true;
        const matchesCreatedAtAfter = createdAtAfter ? new Date(project.createdAt) >= new Date(createdAtAfter) : true;

        return matchesProjectName && matchesOwner && matchesCreatedAtBefore && matchesCreatedAtAfter;
    })

    return (
        <Box p="xl" mx="auto" style={{ maxWidth: 1000 }}>
            <Title order={1} ta="center" mb="xl" >
                PROJECT MANAGEMENT
            </Title>



            <Group gap="xs" mb="sm" style={{ cursor: 'pointer' }} onClick={(e) => {
                e.stopPropagation();
                setOpenedFilters((o) => !o);
            }}>
                {openedFilters ? <Icons.ChevronDown size={22} /> : <Icons.ChevronRight size={22} />}
                <Icons.Filter size={18} />
                <Text size="lg" fw={500}>Filters</Text>
            </Group>
            <Collapse in={openedFilters}>
                <Paper withBorder p="md" >
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" verticalSpacing="md" >
                        <TextInput
                            placeholder="Search by name"
                            leftSection={<Icons.Database size={16} />}
                            value={projectNameFilter}
                            onChange={(e) => setProjectNameFilter(e.target.value)}
                            label="Dataset Name"
                        />
                        <TextInput
                            placeholder="Filter by owner"
                            leftSection={<Icons.User size={16} />}
                            value={ownerFilter}
                            onChange={(e) => setOwnerFilter(e.target.value)}
                            label="Owner Email"
                        />
                        <Group>
                            <DatePickerInput
                                label="Created After"
                                placeholder="Pick date"
                                value={createdAtAfter}
                                onChange={setCreatedAtAfter}
                                w="48%"
                                leftSection={<Icons.Calendar size={16} />}
                                clearable
                            />
                            <DatePickerInput
                                label="Created Before"
                                placeholder="Pick date"
                                value={createdAtBefore}
                                onChange={setCreatedAtBefore}
                                w="48%"
                                leftSection={<Icons.Calendar size={16} />}
                                clearable
                            />
                        </Group>
                        <Box style={{ alignSelf: 'end', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                            >
                                Clear Filters
                            </Button>
                        </Box>
                    </SimpleGrid>
                </Paper>
            </Collapse>

            <DataTable
                title=""
                data={filteredProjects}
                defaultSortField="createdAt"
                pagination
                highlightOnHover
                responsive
                persistTableHead
                striped
                theme={isDark ? "dark" : "default"}
                noDataComponent={
                    <Flex justify="center" align="center" direction="column" p="50" gap="sm">
                        <Text align="center">No projects found</Text>
                    </Flex>}
                progressPending={loading}
                customStyles={customDataTableStyles(theme, isDark)}
                progressComponent={
                    <Flex justify="center" align="center" direction="column" p="50" gap="sm">
                        <Text align="center">Loading...</Text>
                        <Loader />
                    </Flex>
                }
                expandableRows
                expandableRowsComponent={({ data }) => (
                    <ExpandedTestCase projectID={data.id} testCases={data.TestCases || []} admin={true} />
                )}
                columns={[
                    {
                        name: 'Project Name',
                        sortable: true,
                        wrap: true,
                        selector: (project) => project.projectName,
                    },
                    {
                        name: 'Owner',
                        sortable: true,
                        selector: (project) => project.userEmail ? project.userEmail : "Unknown",
                    },
                    {
                        name: 'Created At',
                        sortable: true,
                        selector: (project) => new Date(project.createdAt).toLocaleDateString(),
                    },
                    {
                        name: 'Actions',
                        selector: (project) => (
                            <Group gap="xs" wrap="nowrap">
                                <ActionIcon
                                    title="Download Project"
                                    variant="subtle"
                                    onClick={() => handleDownloadProject(project)}
                                >
                                    <Icons.Download />
                                </ActionIcon>
                                <ActionIcon variant="subtle" onClick={() => handleDelete(project)} title="Delete" color="red">
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

export default ManageProjects;
