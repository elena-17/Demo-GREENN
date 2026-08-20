import {
    Flex, Grid, TextInput, Radio, Button, Group, Stack, Text, Divider, Textarea
} from "@mantine/core";
import { useState, useEffect } from "react";
import { modals } from '@mantine/modals';
import CodecarbonConfig from "./codecarbon-config";

import { Icons } from "../icons";

const TestCaseConfig = ({ config, setConfig, onValidationChange }) => {
    const [error, setError] = useState("");

    if (!config) {
        return null;
    }

    useEffect(() => {
        const isValid = config.name.trim() !== ""
        onValidationChange?.(isValid, isValid ? "" : "TestCase name is required");
    }, [config.name]);

    const handleConfigMeasurer = () => {
        const measurerType = config.measurer.type;

        let localConfig = { ...config.measurer };
        modals.openConfirmModal({
            title: 'Configure Measurer',
            labels: { confirm: 'Save', cancel: 'Cancel' },
            children: (
                <>
                    {measurerType === "codecarbon" ? (
                        <CodecarbonConfigWrapper
                            initialConfig={config.measurer}
                            onConfigChange={(newConfig) => (localConfig = newConfig)}
                        />
                    ) : (
                        <Text size="md" mb="md">EETHAN</Text>
                    )}
                </>

            ),
            onConfirm: () => {
                setConfig({ ...config, measurer: localConfig });
                //console.log('Config saved:', localConfig);
            },
        });
    }

    const CodecarbonConfigWrapper = ({ initialConfig, onConfigChange }) => {
        const [config, setConfig] = useState(initialConfig);

        useEffect(() => {
            onConfigChange(config);
        }, [config]);

        return (
            <CodecarbonConfig config={config} setConfig={setConfig} />
        );
    };



    return (
        <Grid gutter="xl" align="flex-start">
            {/* Fila 1: Nombre del TestCase */}
            <Grid.Col span={{ base: 12, md: 7 }}>
                <TextInput
                    label="Test Case Name"
                    size="md"
                    mb = "md"
                    placeholder="Introduce test case name"
                    value={config.name}
                    required
                    onChange={(event) => setConfig({ ...config, name: event.currentTarget.value })}
                    onBlur={() => {
                        if (config.name.trim() === "") {
                            setError("Name is required");
                        } else {
                            setError("");
                        }
                    }}
                    error={error}
                    withAsterisk
                    styles={{
                        label: { marginBottom: 8 },
                        input: { height: 42 }
                    }}
                />
                <Textarea
                    label="Description"
                    size ="md"
                    placeholder="Enter testcase description (optional)"
                    onChange={(event) => setConfig({ ...config, description: event.currentTarget.value })}
                />
            </Grid.Col>

            {/* Fila 2: Métricas */}
            <Grid.Col span={{ base: 12, md: 7 }} >
                <Radio.Group
                    value={config.metrics[0]}
                    onChange={(value) => setConfig({ ...config, metrics: [value] })}
                    name="testCaseMetrics"
                    label="Measurement Scope"
                    description="Select how measurements will be taken"
                    size="md"
                >
                    <Flex mt="sm" gap="lg" wrap="wrap">
                        <Radio value="total" label="Whole" />
                        <Radio value="epoch" label="Per Epoch" />
                        <Radio value="layer" label="Per Layer" />
                    </Flex>
                </Radio.Group>
            </Grid.Col>

            <Grid.Col span={{ base: 12 }}>
                <Divider />
            </Grid.Col>
            {/* Fila 3: Measurer */}
            <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap={4}>
                    <Radio.Group
                        value={config.measurer.type}
                        onChange={(value) => setConfig({ ...config, measurer: { ...config.measurer, type: value } })}
                        name="measurerType"
                        label="Measuring Instrument"
                        size="md"
                    >
                        <Flex mt="sm" gap="lg" wrap="wrap">
                            <Radio value="codecarbon" label="CodeCarbon" />
                            <Radio value="eethan" label="Eethan" disabled />
                        </Flex>
                    </Radio.Group>

                    <Button
                        variant="light"
                        onClick={handleConfigMeasurer}
                        leftSection={<Icons.Settings size={16} />}
                        mt="md"
                        w="fit-content"
                    >
                        Configure Measurer
                    </Button>
                </Stack>
            </Grid.Col>
        </Grid>
    );
};

export default TestCaseConfig;
