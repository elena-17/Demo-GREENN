import {
    SimpleGrid, Text, Badge, Title, Button, Anchor, Stack, Textarea,
    Group, Box, Flex, Tooltip
} from "@mantine/core";
import { useProjects } from '../contexts/projectsContext';
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { TestCaseService } from "../services/testCaseService";
import { Icons } from "../icons";
import { useNavigate } from "react-router-dom";
import getStatusColor from "../hooks/getStatusColor";

const TestCaseInfoCard = ({ project, testCase, running }) => {
    const { deleteTestCase } = useProjects();
    const navigate = useNavigate();

    const data = [
        {
            label: "Project Name",
            value: project?.projectName || "N/A",
            span: 6
        },
        {
            label: "Test Case Name",
            value: testCase?.name || "N/A",
            span: 6
        },
        {
            label: "Measurement Scope",
            value: testCase?.metrics?.join(", ") || "N/A",
            span: 6
        },
        {
            label: "Measuring Instrument",
            value: testCase?.parameters?.measurer.type || "N/A",
            span: 6
        },
        {
            label: "Created At",
            value: testCase?.createdAt
                ? new Date(testCase.createdAt).toLocaleString()
                : "N/A",
            span: 6
        },
        {
            label: "Last Executed At",
            value: testCase?.executedAt
                ? new Date(testCase.executedAt).toLocaleString()
                : "N/A",
            span: 6
        }
    ];

    const handleDelete = async () => {
        modals.openConfirmModal({
            title: 'Delete TestCase',
            children: (
                <Text size="sm">
                    Are you sure you want to delete this Test Case? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => handleDeleteTestCase(),
        });
    }

    const handleDeleteTestCase = async () => {
        try {
            await TestCaseService.deleteTestCase(testCase.id);
            notifications.show({
                title: `Success`,
                message: `TestCase deleted successfully.`,
            });
            deleteTestCase(project.id, testCase.id);
            setTimeout(() => navigate("/homepage"), 50);
        } catch (error) {
            console.error("Error deleting testCase:", error);
            notifications.show({
                title: `Error`,
                message: `Error deleting testCase: ${error.message}`,
                color: "red"
            });
        }
    }

    const handleEdit = () => {
        navigate(`/testCases/${testCase.id}/edit`);
    }

    const handleNotes = () => {
        let testCaseDescription = testCase?.description || "";

        modals.openConfirmModal({
            title: 'Test Case Description',
            children: (
                <Stack>
                    <Textarea
                        label="Description"
                        defaultValue={testCaseDescription}
                        onChange={(event) => testCaseDescription = event.currentTarget.value}
                    />
                </Stack>
            ),
            labels: { confirm: 'Save', cancel: 'Cancel' },
            confirmProps: { color: 'green' },
            onConfirm: () => {
                saveDescription(testCaseDescription);
            },
        });
    }

    const saveDescription = async (description) => {
        try {
            await TestCaseService.updateDescription(testCase.id, description);
            notifications.show({
                title: `Success`,
                message: `TestCase notes updated successfully.`,
            });
            testCase.description = description;
        }
        catch (error) {
            console.error("Error updating testCase notes:", error);
            notifications.show({
                title: `Error`,
                message: `Error updating testCase notes: ${error.message}`,
                color: "red"
            });
        }
    }


    return (
        <Flex p={0} pt="xl" w="100%" direction="column">
            <Flex justify="space-between" align="center" mb="xl" wrap="wrap" gap="md">

                <Group>
                    <Title order={3}>{testCase?.name || "TestCase summary"}</Title>
                    <Badge
                        color={getStatusColor(testCase?.status)}
                        variant="light"
                        radius="lg"
                    >
                        Status {testCase?.status?.toUpperCase() || "N/A"}
                    </Badge>
                </Group>
                <Group gap="sm">
                    <Tooltip label="Edit this test case (only if status is pending)" withArrow>
                        <Button
                            variant="outline"
                            leftSection={<Icons.Edit size={14} />}
                            // onClick={handleEdit}
                            size="sm"
                            disabled={testCase?.status !== "pending"}
                            title="Edit this test case (only if status is pending)"
                        >
                            Edit
                        </Button>
                    </Tooltip>
                    <Tooltip label="Delete this test case" withArrow>
                        <Button
                            variant="outline"
                            color="red"
                            leftSection={<Icons.Delete size={14} />}
                            // onClick={handleDelete}
                            disabled={running}
                            size="sm"
                            title="Delete this test case"
                        >
                            Delete
                        </Button>
                    </Tooltip>

                </Group>
            </Flex>

            <SimpleGrid
                cols={2}
                spacing="xl"
                verticalSpacing="lg"
                breakpoints={[
                    { maxWidth: 'sm', cols: 1, spacing: 'sm' },
                ]}
                mb="xl"
            >
                {data.map((item, index) => (
                    <Box key={index}>
                        <Text
                            size="sm"
                            c="dimmed"
                            mb={6}
                            fw={600}
                            tt="uppercase"
                            style={{ letterSpacing: 0.5 }}
                        >
                            {item.label}
                        </Text>
                        {typeof item.value === 'string' ? (
                            <Text weight={500} title={item.value}>{item.value}</Text>
                        ) : (
                            item.value
                        )}
                    </Box>
                ))}
            </SimpleGrid>
            <Box mb="xl">
                <Text fz="sm" fw={600} c="dimmed" mb="xs" tt="uppercase">
                    Testcase Description
                </Text>
                <Text td="underline" component="button" type="button" 
                // onClick={handleNotes} 
                style={{
                    textAlign: 'left', whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                }}>
                    Click to view or edit description
                </Text>
            </Box>
        </Flex>
    );
};

export default TestCaseInfoCard;
