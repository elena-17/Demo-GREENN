import { useEffect, useState } from "react";
import { notifications } from '@mantine/notifications';
import DataTable from "react-data-table-component";

import { Icons } from '../../icons';
import { JobService } from "../../services/jobService";
import {
    Button, Loader, Text, Group, ActionIcon, Paper, Collapse, SimpleGrid,
    Flex, Box, Title, MultiSelect, useMantineTheme, useComputedColorScheme,
    Badge

} from "@mantine/core";
import { customDataTableStyles } from "../../styles/customDataTableStyle";
import getStatusColor from "../../hooks/getStatusColor";

const manageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openedFilters, setOpenedFilters] = useState(false);
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const isDark = computedColorScheme === 'dark';
    const theme = useMantineTheme();

    const statusOptions = ['pending', 'running', 'success', 'failed', 'cancelled'];
    const [statusFilter, setStatusFilter] = useState([]);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await JobService.getAllJobs();
            setJobs(response);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            notifications.show({
                title: 'Error',
                message: `Error fetching jobs: ${error.message}`,
                color: "red"
            });
        }
        finally {
            setLoading(false);
        }
    };

    const filteredJobs = statusFilter.length === 0
        ? jobs
        : jobs.filter(job => statusFilter.includes(job.status));


    const resetFilters = () => {
        setStatusFilter([]);
    };

    const handleCancelJob = async (jobId) => {
        try {
            await JobService.cancelJob(jobId);
            notifications.show({
                title: 'Success',
                message: 'Job cancelled successfully',
                color: "green"
            });
            fetchJobs();
        } catch (error) {
            console.error(`Error cancelling job ${jobId}:`, error);
            notifications.show({
                title: 'Error',
                message: `Error cancelling job ${jobId}: ${error.message}`,
                color: "red"
            });
        }
    };

    return (
        <Box p="xl" mx="auto" style={{ maxWidth: 1000 }}>
            <Title order={1} ta="center" mb="xl" >
                JOBS QUEUE MANAGEMENT
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
                        <MultiSelect
                            label="Status"
                            placeholder="Select status"
                            data={statusOptions}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            clearable
                        />

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
                data={filteredJobs}
                defaultSortFieldId="id"
                pagination
                highlightOnHover
                responsive
                persistTableHead
                striped
                theme={isDark ? "dark" : "default"}
                customStyles={customDataTableStyles(theme, isDark)}
                noDataComponent={
                    <Flex justify="center" align="center" direction="column" p="50" gap="sm">
                        <Text align="center">Jobs queue is empty</Text>
                    </Flex>}
                progressPending={loading}
                progressComponent={
                    <Flex justify="center" align="center" direction="column" p="50" gap="sm">
                        <Text align="center">Loading...</Text>
                        <Loader />
                    </Flex>
                }
                columns={[
                    {
                        name: 'Job ID',
                        sortable: true,
                        selector: (job) => job.id,
                        width: '100px',
                    },
                    {
                        name: 'TestCase ID',
                        sortable: true,
                        selector: (job) => job.testCaseId ? job.testCaseId : "-",
                        width: '125px',
                    },
                    {
                        name: 'Created At',
                        sortable: true,
                        selector: (job) => new Date(job.createdAt).toLocaleString(),
                    },
                    {
                        name: 'Started At',
                        sortable: true,
                        selector: (job) => job.startedAt ? new Date(job.startedAt).toLocaleString() : "-",
                    },
                    {
                        name: 'Completed At',
                        sortable: true,
                        selector: (job) => job.completedAt ? new Date(job.completedAt).toLocaleString() : "-",
                    },
                    {
                        name: 'Status',
                        sortable: true,
                        width: '120px',
                        selector: (job) =>
                            <Badge color={getStatusColor(job?.status)}
                                variant="light" size="sm">
                                {job.status ? job.status : "Unknown"}
                            </Badge>,
                        sortFunction: (a, b) => (a.status || '').localeCompare(b.status || ''),
                    },
                    {
                        name: 'Actions',
                        width: '95px',
                        selector: (job) => (
                            <Group gap="xs" wrap="nowrap">
                                <ActionIcon variant="subtle" title="Cancel a running job" color="red"
                                    disabled={job.status !== 'running' && job.status !== 'pending'}
                                    onClick={() => handleCancelJob(job.id)}
                                >
                                    <Icons.Cancel />
                                </ActionIcon>
                            </Group>
                        ),
                    },
                ]}
            />
        </Box>
    );
}

export default manageJobs;
