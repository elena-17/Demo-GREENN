import {
    Group, Stack, Text, Button, useMantineTheme, ActionIcon,
    Badge, Box, Table, Card, Tooltip, ScrollArea, useComputedColorScheme
} from "@mantine/core"
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { Icons } from '../icons';
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { TestCaseService } from "../services/testCaseService";
import { useProjects } from '../contexts/projectsContext';
import getStatusColor from "../hooks/getStatusColor";

const ExpandedTestCase = ({ projectID, testCases, admin = false }) => {
    const theme = useMantineTheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const isDark = computedColorScheme === 'dark';
    const navigate = useNavigate();
    const { deleteTestCase, addTestCase, update_TestCase } = useProjects();

    const handleView = (testcase) => {
        navigate(`/testCases/${testcase.id}`);
    }

    const handleNewTestCase = () => {
        navigate(`/newtestCase/${projectID}`);
    }

    const handleDelete = async (testcaseID) => {
        modals.openConfirmModal({
            title: 'Delete TestCase',
            children: (
                <Text size="sm">
                    Are you sure you want to delete this Test Case? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => handleDeleteTestCase(testcaseID),
        });
    }

    const handleDeleteTestCase = async (testcaseID) => {
        try {
            await TestCaseService.deleteTestCase(testcaseID);
            //console.log("TestCase deleted:");
            notifications.show({
                title: `Success`,
                message: `TestCase deleted successfully.`,
            });
            //console.log("Deleting from project:", projectID, "testCase:", testcaseID);
            deleteTestCase(projectID, testcaseID);
        } catch (error) {
            console.error("Error deleting testCase:", error);
            notifications.show({
                title: `Error`,
                message: `Error deleting testCase: ${error.message}`,
                color: "red"
            });
        }
    };

    const handleDuplicate = async (testcaseID) => {
        try {
            const response = await TestCaseService.duplicateTestCase(testcaseID);
            //console.log("TestCase duplicated:", response);
            addTestCase(Number(projectID), response);
        } catch (error) {
            console.error("Error duplicating testCase:", error);
            notifications.show({
                title: `Error`,
                message: `Error duplicating testCase: ${error.message}`,
                color: "red"
            });
        }
    }


    const handleEdit = (testCaseID) => {
        navigate(`/testCases/${testCaseID}/edit`);
    }


    const handleLaunch = async (testCaseID) => {
        try {
            const response = await TestCaseService.launch(testCaseID);
            //console.log("TestCase launched:", response);
            const idx = testCases.findIndex(tc => tc.id === testCaseID);
            if (idx !== -1) {
                testCases[idx].status = "running";
            }
            update_TestCase(Number(projectID), testCases[idx]);
            notifications.show({
                title: `Success`,
                message: `Test Case launched successfully. Check status`,
            });
        } catch (error) {
            console.error("Error launching testCase:", error);
            notifications.show({
                title: `Error`,
                message: `Error launching Test Case: ${error.message}`,
                color: "red"
            });
        }
    }

    const handleCancelStatus = async (testCaseID) => {
        try {
            //console.log("Cancelling TestCase with ID:", testCaseID);
            await TestCaseService.cancel(testCaseID);
            const idx = testCases.findIndex(tc => tc.id === testCaseID);
            if (idx !== -1) {
                testCases[idx].status = "cancelled";
            }
            update_TestCase(Number(projectID), testCases[idx]);

        } catch (error) {
            console.error("Error cancelling testCase:", error);
            notifications.show({
                title: `Error`,
                message: `Error cancelling testCase: ${error.message}`,
                color: "red"
            });
        }
    }

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


    return (
        <Box p="md" bg={isDark ? theme.colors.dark[6] : theme.colors.gray[2]} ml={47}>
            <Group position="apart" mb="sm">
                {!admin && (<ActionIcon size="xs" variant="subtle" title="Add Test Case" onClick={handleNewTestCase} >
                    <Icons.Plus /> </ActionIcon>)}
                <Text size="sm" weight={600} >
                    Test Cases ({testCases.length})
                </Text>
            </Group>
            {testCases.length === 0 ? (
                <Box p="md">
                    <Text align="center">No test cases available</Text>
                </Box>
            ) : (
                <ScrollArea type="auto">
                    <DataTable
                        data={testCases}
                        highlightOnHover
                        responsive
                        customStyles={customStyles}
                        theme={isDark ? "dark" : "default"}
                        columns={[
                            {
                                name: 'Name',
                                selector: row => row.name,
                                sortable: true,
                                wrap: true,

                            },
                            {
                                name: 'Status',
                                selector: row => (
                                    <Badge
                                    color={getStatusColor(row?.status)}
                                        variant="light" size="sm">
                                        {row.status}
                                    </Badge>
                                ),
                                width: '110px',
                            },
                            {
                                name: 'Execution',
                                width: '120px',
                                center: true,
                                cell: (row) => (
                                    <Group gap="xs" justify="center" align="center">
                                        {row.status !== "running" && (
                                            <ActionIcon variant="subtle" 
                                            // onClick={() => handleLaunch(row.id)}
                                            >
                                                <Icons.Play />
                                            </ActionIcon>)}
                                        {row.status == "running" && (<ActionIcon variant="subtle" color="red" 
                                        // onClick={() => handleCancelStatus(row.id)}
                                        >
                                            <Icons.Cancel size={22} />
                                        </ActionIcon>)}
                                    </Group>)
                            },
                            {
                                name: 'Executed At',
                                selector: row => row?.executedAt ? new Date(row.executedAt).toLocaleString() : "N/A",
                                sortable: true,
                            },
                            {
                                name: 'Actions',
                                cell: (row) => (
                                    <Group gap="xs">

                                        {!admin && (
                                            <ActionIcon variant="subtle" onClick={() => handleView(row)} title="View">
                                                <Icons.Enter size={22} />
                                            </ActionIcon>
                                        )}

                                        {!admin && (
                                            <ActionIcon variant="subtle" 
                                            // onClick={() => handleDuplicate(row.id)}
                                            title="Duplicate">
                                                <Icons.Duplicate />
                                            </ActionIcon>
                                        )}

                                        {!admin && (
                                            <ActionIcon
                                                variant="subtle"
                                                // onClick={() => handleEdit(row.id)}
                                                title="Edit"
                                                disabled={row.status !== 'pending'}
                                            >
                                                <Icons.Edit />
                                            </ActionIcon>
                                        )}
                                        <ActionIcon variant="subtle" color="red" 
                                        // onClick={() => handleDelete(row.id)} 
                                        title="Delete">
                                            <Icons.Delete />
                                        </ActionIcon>
                                    </Group>
                                ),
                            },
                        ]}
                    />
                </ScrollArea>
            )}
        </Box>
    );
};

export default ExpandedTestCase;
