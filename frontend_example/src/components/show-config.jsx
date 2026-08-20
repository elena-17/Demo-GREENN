import {
    Card,
    Accordion,
    Text,
    Badge,
    Stack,
    Table,
    Group,
    Divider,
    Title,
    Flex,
    Button
} from "@mantine/core";
import { Icons } from "../icons";
import { TestCaseService } from "../services/testCaseService";
import { notifications } from "@mantine/notifications";
import { useParams, useNavigate } from "react-router-dom";

const ShowConfig = ({ parameters, dataset }) => {
    const { model, trainer, measurer } = parameters;
    const { testCaseID } = useParams();

    const renderTable = (obj) => (
        <Table withRowBorders>
            <Table.Tbody>
                {Object.entries(obj).map(([key, value]) => (
                    <Table.Tr key={key}>
                        <Table.Td>{key.replace(/_/g, " ")}</Table.Td>
                        <Table.Td>
                            {Array.isArray(value)
                                ? value.join(", ")
                                : typeof value === "boolean" ? (
                                    value ? "Yes" : "No"
                                ) : typeof value === "object" && value !== null ? (
                                    renderTable(value))
                                    : value}
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );

    const handleDownloadJson = async () => {
        try {
            const blob = await TestCaseService.downloadConfig(testCaseID);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/json' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `test_case_${testCaseID}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading JSON:", error);
            notifications.show({
                title: 'Error',
                message: 'Failed to download JSON',
                color: 'red',
            });
        }
    };

    return (
        <Flex pt="xl" direction="column">
            <Group justify="space-between" mb="md">
                <Title order={3} mb="sm">Configuration Parameters</Title>
                <Button variant="outline" leftSection={<Icons.Download />} 
                // onClick={handleDownloadJson}
                > Download JSON</Button>
            </Group>
            <Accordion variant="separated" transitionDuration={200}>
                <Accordion.Item value="model">
                    <Accordion.Control>Model</Accordion.Control>
                    <Accordion.Panel>
                        <Stack spacing="xs">
                            <Text size="sm">Loss: {model.loss}</Text>
                            <Text size="sm">Seed: {model.seed}</Text>
                            <Text size="sm">Metrics: {model.metrics?.length ? model.metrics.join(", ") : "None"}</Text>
                            <Divider my="xs" label="Layers" labelPosition="center" />
                            <Stack spacing="xs">
                                {model.layers.map((layer, i) => (
                                    <Card key={layer.id} shadow="xs" padding="sm" withBorder
                                    >
                                        <Group justify="space-between">
                                            <Text fw={600}>{layer.type.toUpperCase()}</Text>
                                            <Badge color={layer.type === "dense" ? "grape" : "blue"}>
                                                {layer.activation}
                                            </Badge>
                                        </Group>
                                        <Table withColumnBorders mt="xs" style={{ tableLayout: "fixed", width: "100%" }}>
                                            <tbody>
                                                {Object.entries(layer).map(([k, v]) =>
                                                    k !== "id" && (
                                                        <tr key={k}>
                                                            <td style={{ fontWeight: 500 }}>{k}</td>
                                                            <td>
                                                                {typeof v === "boolean" ? (v ? "Yes" : "No") : v}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card>
                                ))}
                            </Stack>
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="trainer">
                    <Accordion.Control>Trainer</Accordion.Control>
                    <Accordion.Panel>{renderTable(trainer)}</Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="measurer">
                    <Accordion.Control>Measurer</Accordion.Control>
                    <Accordion.Panel>{renderTable(measurer)}</Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="dataset">
                    <Accordion.Control>Dataset</Accordion.Control>
                    <Accordion.Panel>
                        <Table withRowBorders>
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td>name</Table.Td>
                                    <Table.Td>{dataset.name}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>number of classes</Table.Td>
                                    <Table.Td>{dataset.num_classes}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>number of samples</Table.Td>
                                    <Table.Td>{dataset.metadata.num_samples}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>input size</Table.Td>
                                    <Table.Td>{dataset.metadata.input_size.join(" x ")}</Table.Td>
                                </Table.Tr>
                                {/* <Table.Tr>
                                        <Table.Td>class distribution</Table.Td>
                                        <Table.Td>
                                            {Object.entries(dataset.metadata.class_distribution).map(([key, value]) => (
                                                <Text key={key} size="sm">
                                                    {key}: {value}
                                                </Text>
                                            ))}
                                        </Table.Td>
                                    </Table.Tr> */}
                            </Table.Tbody>
                        </Table>

                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Flex>
    );
};

export default ShowConfig;
