import {
    Button, Group, Stack, TextInput, HoverCard, List, Flex, SimpleGrid, NumberInput, Paper, Collapse,
    FileInput, Title, Modal, Progress, Text, Box, LoadingOverlay, Table, Tooltip, ActionIcon, useMantineTheme, useComputedColorScheme
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { FileService } from '../../services/fileService';
import { Icons } from '../../icons';
import { AdminService } from '../../services/adminService';
import { modals } from '@mantine/modals';


const ManageDatasets = () => {
    const [loading, setLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [abortController, setAbortController] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [datasets, setDatasets] = useState([]);
    const [openedFilters, setOpenedFilters] = useState(false);
    const theme = useMantineTheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const isDark = computedColorScheme === 'dark';

    const form = useForm({
        initialValues: {
            name: '',
            file: null,
        },

        validate: {
            name: (value) => (value.length < 1 ? 'Name is required' : null),
            file: (value) => (!value ? 'File is required' : null),
        },
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getDatasets();
            setDatasets(response);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const handleSubmit = async (values) => {
        const formData = new FormData();
        formData.append('file', values.file);
        formData.append('name', values.name);

        const controller = new AbortController();
        setAbortController(controller);
        const renderMessage = (progress, onCancel) => (
            <Stack gap="xs">
                <Text>{progress}% uploaded</Text>
                <Progress value={progress} size="sm" animated striped />
                <Button size="xs" color="red" onClick={onCancel} rightSection={<Icons.Cancel />}>
                    Cancel
                </Button>
            </Stack>
        );

        const id = notifications.show({
            title: 'Uploading...',
            message: renderMessage(uploadProgress, () => controller.abort()),
            autoClose: false,
            loading: false,
            withCloseButton: false,
        });



        let lastPercent = 0;

        try {
            const response = await FileService.uploadDataset(
                formData,
                controller.signal,
                (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (percent - lastPercent >= 5 || percent === 100) {
                        lastPercent = percent;
                        setUploadProgress(percent);
                        notifications.update({
                            id,
                            message: renderMessage(percent, () => controller.abort()),
                        });
                    }
                }
            );

            notifications.update({
                id,
                title: 'Validating...',
                message: 'Please wait while we validate the dataset',
            });

            if (response) {
                notifications.update({
                    id,
                    title: 'Success',
                    message: 'Dataset uploaded and validated successfully',
                    withCloseButton: true,
                    loading: false,
                    autoClose: 2000,
                });
                fetchData();
            }

        } catch (error) {
            if (axios.isCancel(error)) {
                notifications.update({
                    id,
                    title: 'Upload Cancelled',
                    message: 'The upload was cancelled by the user',
                    color: 'yellow',
                    loading: false,
                    withCloseButton: true,
                    autoClose: 3000,
                });
            } else {
                notifications.update({
                    id,
                    title: 'Error',
                    message: `Failed to upload dataset. ${error.response?.data?.error}`,
                    color: 'red',
                    loading: false,
                    withCloseButton: true,
                    autoClose: 3000,
                });
            }
        } finally {
            setLoading(false);
            setUploadProgress(0);
            setAbortController(null);
            form.reset();
        }
    };


    const handleAddNew = () => {
        setOpened(true);
    }

    const closeModal = () => {
        setOpened(false);
        form.reset();
    }

    const handleDeleteConfirmation = async (id) => {
        try {
            await AdminService.deleteDataset(id);
            setDatasets(datasets.filter(u => u.id !== id));
        } catch (error) {
            console.error('Error deleting dataset:', error);
            notifications.show({
                title: 'Error',
                message: `Failed to delete dataset. ${error.response?.data?.error}`,
                color: 'red',
            });
        }
    }

    const handleDelete = (dataset) => {
        modals.openConfirmModal({
            title: 'Delete Dataset',
            children: (
                <Text size="md" style={{ wordWrap: 'break-word' }}>
                    Are you sure you want to delete <strong>"{dataset?.name}"</strong>?
                    <br />
                    <strong>WARNING:</strong> This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => handleDeleteConfirmation(dataset.id),
        });
    };


    function formatBytesToMB(bytes) {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    }


    const handleShowDetails = (dataset) => {
        modals.open({
            title: (
                <Group gap="sm">
                    <Text size="xl" fw={600}>Dataset Details: {dataset.name}</Text>
                </Group>
            ),
            children: (
                <Box p="sm">
                    <SimpleGrid cols={2} spacing="lg" verticalSpacing="sm" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                        {/* Columna 1 - Información básica */}
                        <Stack spacing="xs">
                            <Text size="lg" fw={700} mb="sm">Basic Information</Text>

                            <DetailItem
                                label="Dataset ID"
                                value={dataset.id}
                            />

                            <DetailItem
                                label="Created At"
                                value={new Date(dataset.createdAt).toLocaleString()}
                            />

                            <DetailItem
                                label="Owner"
                                value={dataset.userEmail}
                            />

                            <DetailItem
                                label="Name"
                                value={dataset.name}
                            />
                        </Stack>

                        {/* Columna 2 - Estadísticas */}
                        <Stack spacing="xs">
                            <Text size="lg" fw={700} mb="sm">Statistics</Text>

                            <DetailItem
                                label="Number of Classes"
                                value={dataset.num_classes ?? '—'}
                            />

                            <DetailItem
                                label="Number of Samples"
                                value={dataset.metadata?.num_samples ?? '—'}
                            />

                            <DetailItem
                                label="Input Size"
                                value={Array.isArray(dataset.metadata?.input_size)
                                    ? dataset.metadata.input_size.join(' × ')
                                    : '—'}
                            />

                            <DetailItem
                                label="Size"
                                value={dataset.size ? formatBytesToMB(dataset.size) : '—'}
                            />
                            <DetailItem
                                label="Used in Tests"
                                value={dataset.usedInTests ?? '—'}
                            />
                            <DetailItem
                                label="Last Run"
                                value={dataset.metadata?.last_run
                                    ? new Date(dataset.lastRun).toLocaleString()
                                    : '—'}
                            />
                        </Stack>
                    </SimpleGrid>
                </Box>
            ),
            size: 'lg',
        });
    };

    // Componente auxiliar para items de detalle
    const DetailItem = ({ label, value }) => (
        <Group gap="sm" align="flex-start" noWrap>
            <Box>
                <Text size="sm" c="dimmed" fw={500}>{label}</Text>
                <Text>{value}</Text>
            </Box>
        </Group>
    );


    const [nameFilter, setNameFilter] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [minClassesFilter, setMinClassesFilter] = useState(0);
    const [minSamplesFilter, setMinSamplesFilter] = useState(0);
    const [minTestCasesFilter, setMinTestCasesFilter] = useState(0);

    const filteredDatasets = datasets.filter(dataset => {
        const matchesName = dataset.name.toLowerCase().includes(nameFilter.toLowerCase());
        const matchesOwner = dataset.userEmail.toLowerCase().includes(ownerFilter.toLowerCase());
        const matchesMinClasses = dataset.num_classes >= (minClassesFilter || 0);
        const matchesMinSamples = dataset.metadata?.num_samples >= (minSamplesFilter || 0);
        const matchesMinTestCases = dataset.usedInTests >= (minTestCasesFilter || 0);
        return matchesName && matchesOwner && matchesMinClasses && matchesMinSamples && matchesMinTestCases;
    })

    const isFiltered = nameFilter || ownerFilter;

    const resetFilters = () => {
        setNameFilter('');
        setOwnerFilter('');
        setMinClassesFilter(0);
        setMinSamplesFilter(0);
        setMinTestCasesFilter(0);
    }

    return (
        <Box p="xl" mx="auto" style={{ maxWidth: 1000 }}>
            <Title order={1} ta="center" mb="xl">DATASET MANAGEMENT</Title>
            <Group justify='space-between' align="center" mb="sm">
                <Group gap="xs" style={{ cursor: 'pointer' }} onClick={(e) => {
                    e.stopPropagation();
                    setOpenedFilters((o) => !o);
                }}>
                    {openedFilters ? <Icons.ChevronDown size={22} /> : <Icons.ChevronRight size={22} />}
                    <Icons.Filter size={18} />
                    <Text size="lg" fw={500}>Filters</Text>
                </Group>

                <Button
                    variant="outline"
                    leftSection={<Icons.Plus size={16} />}
                    onClick={(e) => { handleAddNew(); }}
                    size="sm"
                >
                    Add New Dataset
                </Button>
            </Group>

            {/* Collapsible content */}
            <Collapse in={openedFilters}>
                <Paper withBorder p="md" >
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" verticalSpacing="md" >
                        <TextInput
                            placeholder="Search by name"
                            leftSection={<Icons.Database size={16} />}
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            label="Dataset Name"
                        />
                        <TextInput
                            placeholder="Filter by owner"
                            leftSection={<Icons.User size={16} />}
                            value={ownerFilter}
                            onChange={(e) => setOwnerFilter(e.target.value)}
                            label="Owner Email"
                        />
                        <NumberInput
                            min={0}
                            value={minClassesFilter}
                            onChange={setMinClassesFilter}
                            leftSection={<Icons.Category size={16} />}
                            label="Minimum Classes"
                            stepHoldDelay={500}
                            stepHoldInterval={100}
                        />
                        <NumberInput
                            min={0}
                            value={minSamplesFilter}
                            onChange={setMinSamplesFilter}
                            leftSection={<Icons.Samples size={16} />}
                            label="Minimum Samples"
                            stepHoldDelay={500}
                            stepHoldInterval={100}
                        />
                        <NumberInput
                            min={0}
                            value={minTestCasesFilter}
                            onChange={setMinTestCasesFilter}
                            leftSection={<Icons.Test size={16} />}
                            label="Minimum TestCases"
                            stepHoldDelay={500}
                            stepHoldInterval={100}
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

            <Box style={{ position: 'relative' }}>
                <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

                <Table striped highlightOnHover stickyHeader stickyHeaderOffset={60}>
                    <Table.Thead bg={isDark ? theme.colors.dark[7] : theme.colors.gray[1]}>
                        <Table.Tr>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Owner</Table.Th>
                            <Table.Th>Name</Table.Th>
                            <Table.Th style={{ maxWidth: '40px' }}>Num Clases</Table.Th>
                            <Table.Th style={{ maxWidth: '50px' }}>Num Samples</Table.Th>
                            <Table.Th>Input Size</Table.Th>
                            <Table.Th style={{ maxWidth: '50px' }}>TestCases</Table.Th>
                            {/* <Table.Th>Distribution</Table.Th> */}
                            <Table.Th>Action</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredDatasets.length === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={8} style={{ textAlign: 'center' }}>
                                    No datasets found
                                </Table.Td>
                            </Table.Tr>
                        )}

                        {filteredDatasets.map(dataset => (
                            <Table.Tr key={dataset.id}>
                                <Table.Td>{dataset.id}</Table.Td>
                                <Table.Td style={{
                                    maxWidth: '80px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }} title={dataset.userEmail}>
                                    {dataset.userEmail}
                                </Table.Td>
                                <Table.Td style={{
                                    maxWidth: '120px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }} title={dataset.name}>
                                    {dataset.name}
                                </Table.Td>
                                <Table.Td>{dataset.num_classes ?? '—'}</Table.Td>
                                <Table.Td>{dataset.metadata?.num_samples ?? '—'}</Table.Td>
                                <Table.Td>
                                    {Array.isArray(dataset.metadata?.input_size)
                                        ? dataset.metadata.input_size.join(' x ')
                                        : '—'}
                                </Table.Td>
                                {/* hacer un grafico */}
                                {/* <Table.Td style={{
                                    maxWidth: '150px',
                                    whiteSpace: 'wrap',
                                    overflow: 'hidden',
                                }}>
                                    {dataset.metadata?.class_distribution
                                        ? Object.entries(dataset.metadata.class_distribution)
                                            .map(([label, count]) => `${label}: ${count}`)
                                            .join(', ')
                                        : '—'}
                                </Table.Td> */}
                                <Table.Td>
                                    {dataset.usedInTests ? dataset.usedInTests.toString() : '0'}
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Tooltip label="Show details">
                                            <ActionIcon
                                                variant="subtle"
                                                onClick={() => handleShowDetails(dataset)}
                                            >
                                                <Icons.Info size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Delete dataset">
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() => handleDelete(dataset)}
                                            >
                                                <Icons.Delete size={16} />
                                            </ActionIcon>
                                        </Tooltip>

                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Box>



            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Upload Dataset"
                size="md"
            >

                <Stack>
                    <TextInput
                        label="Dataset Name"
                        placeholder="Enter dataset name"
                        required
                        {...form.getInputProps('name')}
                    />
                    <FileInput
                        label="Upload Dataset File"
                        placeholder="Upload your dataset file .pkl"
                        accept=".pkl"
                        required
                        clearable
                        {...form.getInputProps('file')}
                    />
                    <HoverCard width={400} shadow="md" withArrow dropdownPosition="top-start">
                        <HoverCard.Target>
                            <Flex align="center" gap={5}>
                                <Icons.Question size={16} />
                                <Text size="sm" c="dimmed">
                                    Need help with the dataset format?
                                </Text>
                            </Flex>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <List size="sm" spacing="xs">
                                <List.Item>The dataset should be in .pkl format</List.Item>
                                <List.Item>Dictionary with keys: <br />X, y and labels</List.Item>
                                <List.Item>Each key should contain a numpy array</List.Item>
                                <List.Item>y must be one hot encoded</List.Item>
                                <List.Item>X must have 4 dimensions (NCHW)</List.Item>
                            </List>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </Stack>
                <Group justify="flex-end" align="flex-end" mt="md">
                    <Button variant="outline" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button
                        onClick={form.onSubmit((values) => {
                            handleSubmit(values);
                            setOpened(false);
                        })}
                        loading={loading}
                    >
                        Upload
                    </Button>
                </Group>
            </Modal>
        </Box>
    );
};

export default ManageDatasets;
