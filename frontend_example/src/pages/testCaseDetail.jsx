import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Text, Title, Button, Stack, Loader, Flex, Accordion, Container, Group, Alert, ActionIcon, Box, Paper, useComputedColorScheme } from "@mantine/core";
import { useState, useEffect, useRef } from "react";
import { TestCaseService } from "../services/testCaseService";
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import TestCaseInfoCard from "../components/testCase-info";
import CnnLoader from "../components/cnn-loader";
import Results from "../components/results-training";
import ResultsEnergy from "../components/results-energy";
import ShowConfig from "../components/show-config";
import { WS_URL } from "../config";
import { Icons } from "../icons";

import ResultsCompare from "../components/results-both"; // Import the compare component
import { ResultService } from "../services/resultService";

const TestCaseDetail = () => {
    const { testCaseID } = useParams();
    const [testCase, setTestCase] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const wsRef = useRef(null);
    const navigate = useNavigate();
    const [running, setRunning] = useState(false);
    const [isLoadingDataset, setIsLoadingDataset] = useState(true);

    const [errorLog, setErrorLog] = useState(null);
    const [logVisible, setLogVisible] = useState(false);
    const [loadingLog, setLoadingLog] = useState(false);
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const isDark = computedColorScheme === 'dark';
    const [progressState, setProgressState] = useState({
        epoch: 0,            // número de época actual
        percentage: 0,          // % completo
        current: 0,             // iter actual
        total: 0,               // iter totales
        elapsed: "00:00",       // tiempo transcurrido
        status: "running"       // estado
    });

    useEffect(() => {
        fetchTestCase();
        //connectWebSocket();
        setRunning(false);
    }, [testCaseID]);


    const fetchTestCase = async () => {
        try {
            setLoading(true);
            const response = await TestCaseService.getTestCaseById(testCaseID);
            // console.log("Fetched Test Case:", response);
            setTestCase(response);
            setProject(response.EMProject);
        } catch (error) {
            console.error("Error fetching Test Case:", error);
            notifications.show({
                title: `Error`,
                message: `Error fetching Test Case: ${error.message}`,
                color: "red"
            });
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadLog = () => {
        const blob = new Blob([errorLog], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `error_log_testCase_${testCase.id}.log`;
        link.click();
    };

    const fetchErrorLog = async () => {
        setLoadingLog(true);
        try {
            const response = await TestCaseService.getErrorLog(testCaseID);
            setErrorLog(response);
        } catch (error) {
            console.error("Error fetching error log:", error);
            notifications.show({
                title: `Error`,
                message: `Error fetching error log: ${error.message}`,
                color: "red"
            });
        } finally {
            setLoadingLog(false);
        }
    }

    const checkNotRunned = () => {
        if (testCase?.status !== "success") {
            handleLaunch();
        }
        else {
            modals.openConfirmModal({
                title: 'Warning',
                children: (
                    <Text size="sm">
                        This Test Case has already been runned. Do you want to run it again? This will delete the previous results.
                    </Text>
                ),
                labels: { confirm: 'Continue', cancel: 'Cancel' },
                confirmProps: {},
                onConfirm: () => handleLaunch(),
                onCancel: () => setRunning(false),
            });
        }
    }

    const handleLaunch = async () => {
        try {
            connectWebSocket();
            setErrorLog(null); // Reset error log state
            setLogVisible(false); // Reset log visibility state
            const response = await TestCaseService.launch(testCaseID);
            //console.log("Launch response:", response);
            notifications.show({
                title: `Success`,
                message: `Test Case launched successfully. Check status`,
            });
            setTestCase((prev) => ({
                ...prev,
                status: response.testcase_status,
                executedAt: new Date().toLocaleString()
            }));
        } catch (error) {
            console.error("Error launching testCase:", error);
            notifications.show({
                title: `Error`,
                message: `Error launching Test Case: ${error.message}`,
                color: "red"
            });
            setTestCase((prev) => ({
                ...prev,
                status: error.testcase_status || "failed"
            }));
        }
    }

    const connectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        const ws = new WebSocket(WS_URL); // Conectar al servidor WebSocket
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ action: "subscribe", testCaseId: testCaseID }));
            ws.send(JSON.stringify({ action: "getStatus", testCaseId: testCaseID }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            //console.log("WebSocket message received:", data);
            if (!data.status) return;

            switch (data.status) {
                case "start_running":
                    setTestCase((prev) => ({
                        ...prev,
                        status: "running",
                        executedAt: data.executedAt,
                    }));
                    setRunning(true);
                    break;

                case "running":
                    setRunning(true);
                    break;

                case "idle":
                    setRunning(false);
                    break;

                case "loading":
                    setIsLoadingDataset(true);
                    break;

                case "progress":
                    setProgressState({
                        epoch: data.epoch,
                        percentage: data.percentage,
                        total: data.total,
                        current: data.batch,
                        elapsed: data.elapsed || "00:00",
                    });
                    setIsLoadingDataset(false);
                    break;

                case "success":
                case "failed":
                case "cancelled":
                    handleTestCaseEnd(data);
                    break;

                default:
                    console.warn("Unknown WebSocket status:", data.status);
                    break;
            }
        };

        ws.onclose = () => {
            //console.log('WebSocket connection closed');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    const handleTestCaseEnd = (data) => {
        setTestCase((prev) => ({
            ...prev,
            status: data.status,
            executedAt: data.executedAt,
        }));

        setIsLoadingDataset(true);
        setRunning(false);
        resetProgress();

        notifications.show({
            title: `TestCase ${data.status}`,
            message: `TestCase "${testCase?.name || 'Unknown'}" of ${project?.projectName || 'Unknown'} has ended.`,
            position: 'top-center',
            color: data.status === "success" ? "green" : "red",
        });

        wsRef.current?.close();
    };


    const handleCancelStatus = async () => {
        try {
            setRunning(false);
            resetProgress();
            //console.log("Cancelling TestCase with ID:", testCaseID);
            await TestCaseService.cancel(testCaseID);
            setTestCase((prev) => ({
                ...prev,
                status: "cancelled",
            }));
        } catch (error) {
            console.error("Error cancelling testCase:", error);
            notifications.show({
                title: `Error`,
                message: `Error cancelling testCase: ${error.message}`,
                color: "red"
            });
        }
    }

    const resetProgress = () => {
        setProgressState({
            epoch: 0,
            percentage: 0,
            current: 0,
            total: 0,
            elapsed: "00:00",
        });
    };

    const handleDownloadResults = async () => {
        try {
            const response = await ResultService.downloadResults(testCaseID);
            const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${testCaseID}_results_testCase.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading results:", error);
            notifications.show({
                title: `Error`,
                message: `Error downloading results: ${error.message}`,
                color: "red"
            });
        }
    };

    return (
        <Stack spacing="lg" p={{ base: 'md', md: 'xl' }} pt={0} h="100%" w="100%" mx="auto" maw={1000}>
            <Title order={1} ta="center" mb={0}>TEST CASE DETAILS</Title>
            <Text ta="center" c="dimmed" size="sm" mb="md">
                Name: {project?.projectName} - {testCase?.name}
            </Text>

            <Tabs defaultValue="status" keepMounted={false}>
                <Tabs.List grow justify="space-between">
                    <Tabs.Tab value="status">
                        Status
                    </Tabs.Tab>
                    <Tabs.Tab value="configuration">
                        Configuration
                    </Tabs.Tab>
                    <Tabs.Tab value="training">
                        Training Results
                    </Tabs.Tab>
                    <Tabs.Tab value="energy">
                        Energy Results
                    </Tabs.Tab>

                    <Tabs.Tab value="compare">
                        Energy+Training
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="status">
                    {loading ? (
                        <Flex justify="center" align="center" w="100%" mt={50}>
                            <Loader size="md" />
                        </Flex>
                    ) : (
                        <Stack>
                            <TestCaseInfoCard project={project} testCase={testCase} running={running} />

                            {running ? (
                                <Container m={0} mt="md" p={0}>
                                    <CnnLoader loading={isLoadingDataset} total={testCase.parameters.trainer.epochs} running={running} progressState={progressState} />
                                    <Button mt="xl" 
                                    // onClick={handleCancelStatus} 
                                    color="red" leftSection={<Icons.Cancel size={16} />} >
                                        Cancel
                                    </Button>
                                </Container>
                            ) : (
                                <Stack mt="md" gap="xl">
                                    <Group position="center" gap="xl">
                                        <Button
                                            size="md"
                                            // onClick={checkNotRunned}
                                            disabled={running || (testCase?.status === "in-queue")}
                                            variant="outline"
                                            w="fit-content"
                                            leftSection={<Icons.Play size={16} />}
                                        >
                                            {testCase?.status === "pending" ? "Launch Test Case" : "Run Again"}
                                        </Button>
                                    </Group>
                                    {testCase?.status === "success" && (
                                        <Paper
                                            bg={isDark ? "green.9" : "green.7"}
                                            c="white"
                                            p="lg"
                                            radius="md"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            <Box style={{ fontSize: '2.5rem' }}>
                                                <Icons.Check />
                                            </Box>

                                            <Box style={{ flex: 1 }}>
                                                <Text span fw={700} inherit>
                                                    RESULTS
                                                </Text>{' '}
                                                are now available, go to the corresponding tabs.
                                                <br />
                                                Or download them here.
                                            </Box>

                                            <Button color="white" variant="outline" size="sm"
                                                leftSection={<Icons.Download size={16} />}
                                                // onClick={handleDownloadResults}
                                                >
                                                Download
                                            </Button>
                                        </Paper>
                                    )}
                                </Stack>
                            )}
                            {(testCase?.status === "failed" || testCase?.status === "cancelled") && !running && (
                                <Accordion
                                    mt="md" chevronPosition="right"
                                    variant="separated"
                                    onChange={(value) => {
                                        if (value === "error-log" && !errorLog) {
                                            fetchErrorLog();
                                        }
                                    }}
                                >
                                    <Accordion.Item value="error-log">
                                        <Accordion.Control>View Error Log</Accordion.Control>
                                        <Accordion.Panel>
                                            {loadingLog ? (
                                                <Flex justify="center" align="center" w="100%" mt={50}>
                                                    <Loader size="md" />
                                                </Flex>
                                            ) : (
                                                <Stack spacing={0}>
                                                    <Button mt="md" 
                                                    // onClick={handleDownloadLog} 
                                                    leftSection={<Icons.Download />} color="blue">
                                                        Download Log
                                                    </Button>
                                                    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                                        {errorLog}
                                                    </pre>
                                                </Stack>
                                            )}
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                        </Stack>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="configuration">
                    {testCase?.parameters ? (
                        <ShowConfig parameters={testCase.parameters} dataset={testCase.Dataset} />
                    ) : (
                        <Flex justify="center" align="center" w="100%" mt={50}>
                            <Loader size="md" />
                        </Flex>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="training">
                    <Results state={testCase?.status} testCaseID={testCaseID} />
                </Tabs.Panel>
                <Tabs.Panel value="energy">
                    <ResultsEnergy state={testCase?.status} testCaseID={testCaseID} measurer={testCase?.parameters.measurer.type} metrics={testCase?.metrics?.join(", ")} />
                </Tabs.Panel>


                <Tabs.Panel value="compare">
                    <ResultsCompare testCaseID={testCaseID} state={testCase?.status} metrics={testCase?.metrics?.join(", ")} />
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
};

export default TestCaseDetail;
