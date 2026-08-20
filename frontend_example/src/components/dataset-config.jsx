import {
    Button, Flex, Group, Text, TextInput, Box, Loader, Table, Badge, Modal, FileInput, Stack, Progress, ActionIcon, useMantineTheme, Checkbox, HoverCard, List
} from "@mantine/core";
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from "react";
import { useForm } from '@mantine/form';
import { notifications } from "@mantine/notifications";
import { FileService } from "../services/fileService";
import { AdminService } from "../services/adminService";
import { Icons } from "../icons";
import { DatasetService } from "../services/datasetService";
import axios from "axios";
import { modals } from "@mantine/modals";

const DatasetConfig = ({ initialDataset, setInitialDataset, onValidationChange, setDatasetClasses }) => {
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [abortController, setAbortController] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

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

    useEffect(() => {
        const isValid = selectedDataset !== null;
        onValidationChange?.(isValid, isValid ? "" : "Select a dataset");
    }, [selectedDataset]);



    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await DatasetService.getDatasets();
            const defaultResponse = await DatasetService.getDefaultDatasets();
            setDatasets([
                ...defaultResponse.map((ds) => ({ ...ds, isUserDataset: false })),
                ...response.map((ds) => ({ ...ds, isUserDataset: true })),
            ]);
            // Buscar y seleccionar el initialDataset si existe
            const allDatasets = [...response, ...defaultResponse];
            const found = allDatasets.find(d => d.id === initialDataset);
            if (found) {
                setSelectedDataset(found);
                setDatasetClasses(found.num_classes);
            }
        } catch (error) {
            console.error('Error fetching datasets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDatasetSelect = (id) => {
        const dataset = datasets.find(d => d.id === id);
        setSelectedDataset(dataset);
        setInitialDataset(dataset.id);
        setDatasetClasses(dataset.num_classes);
    }

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
                controller.signal, // <- pasamos el signal
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
                    color: 'green',
                    withCloseButton: true,
                    loading: false,
                    autoClose: 2000,
                });
                //console.log(response);
                fetchData();
            }

        } catch (error) {
            //console.log(error)
            if (axios.isCancel(error)) {
                notifications.update({
                    id,
                    title: 'Upload Cancelled',
                    message: 'The upload was cancelled by the user',
                    color: 'yellow',
                    loading: false,
                    withCloseButton: true,
                    autoClose: 2000,
                });
            } else {
                notifications.update({
                    id,
                    title: 'Error',
                    message: `Failed to delete dataset. ${error.response?.data?.error}`,
                    color: 'red',
                    loading: false,
                    withCloseButton: true,
                    autoClose: 2000,
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



    return (
        <Box>
            {loading ? (
                <Flex justify="center" align="center" style={{ height: '100vh' }}>
                    <Loader size="xl" />
                </Flex>
            ) : (
                <Box>
                    <Flex justify="space-between" align="center" mb="md">
                        <Text size="xl">Dataset Collection</Text>
                        <Button
                            variant="outline"
                            onClick={handleAddNew}
                            leftSection={<Icons.Plus />}
                            size="sm"
                        >
                            Add New Dataset
                        </Button>
                    </Flex>

                    <Table striped highlightOnHover horizontalSpacing="xs" >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ maxWidth: '50px' }}>Selected</Table.Th>
                                <Table.Th>Name</Table.Th>
                                <Table.Th style={{ maxWidth: '60px' }}>Num Clases</Table.Th>
                                <Table.Th style={{ maxWidth: '60px' }}>Num Samples</Table.Th>
                                <Table.Th>Input Size</Table.Th>
                                {/* {!isMobile && <Table.Th>Distribution</Table.Th>} */}
                                <Table.Th>Owner</Table.Th>
                                <Table.Th style={{ maxWidth: '50px' }}>Delete</Table.Th>
                            </Table.Tr>
                        </Table.Thead>

                        <Table.Tbody>
                            {datasets.map(dataset => {
                                const isSelected = selectedDataset && selectedDataset.id === dataset.id;
                                return (
                                    <Table.Tr
                                        key={dataset.id}
                                        onClick={() => handleDatasetSelect(dataset.id, true)}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: isSelected ? 'var(--mantine-color-green-light)' : undefined,
                                        }}
                                    >
                                        <Table.Td> <Checkbox checked={isSelected} /> </Table.Td>
                                        <Table.Td>{dataset.name}</Table.Td>
                                        <Table.Td>{dataset.num_classes ?? '—'}</Table.Td>
                                        <Table.Td>{dataset.metadata?.num_samples ?? '—'}</Table.Td>
                                        <Table.Td>
                                            {Array.isArray(dataset.metadata?.input_size)
                                                ? dataset.metadata.input_size.join(' x ')
                                                : '—'}
                                        </Table.Td>
                                        {/* {!isMobile && (
                                            <Table.Td style={{ maxWidth: 150, whiteSpace: 'wrap', overflow: 'hidden' }}>
                                                {dataset.metadata?.class_distribution
                                                    ? Object.entries(dataset.metadata.class_distribution)
                                                        .map(([label, count]) => `${label}: ${count}`)
                                                        .join(', ')
                                                    : '—'}
                                            </Table.Td>
                                        )} */}
                                        <Table.Td>
                                            <Badge
                                                variant={dataset.isUserDataset ? 'light' : 'default'}
                                                color={dataset.isUserDataset ? 'green' : 'gray'}
                                            >
                                                {dataset.isUserDataset ? 'Mine' : 'Default'}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            {dataset.isUserDataset && (
                                                <ActionIcon
                                                    size="sm"
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // evita seleccionar al borrar
                                                        handleDelete(dataset);
                                                    }}
                                                >
                                                    <Icons.Delete />
                                                </ActionIcon>
                                            )}
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </Box>
            )}

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
                                <List.Item>Dictionary with keys:
                                    <List size="sm" spacing="xs">
                                        <List.Item><b>X_train, X_test</b>: Numpy arrays with shape (N, C, H, W)</List.Item>
                                        <List.Item><b>y_train, y_test</b>: Class names</List.Item>
                                        <List.Item><b>train_labels, test_labels</b>: One-hot encoded labels</List.Item>
                                    </List>
                                </List.Item>
                                <List.Item>Each key should contain a numpy array</List.Item>
                                <List.Item>Labels must be one hot encoded</List.Item>
                                <List.Item>X must have 4 dimensions (NCHW)</List.Item>
                            </List>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </Stack>
                <Group justify="flex-end" mt="md">
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
        </Box >
    );

};

export default DatasetConfig;
