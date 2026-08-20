import { NumberInput, Grid, Checkbox, Group, Select, Card, Stack, Title, Box, Text, Divider } from "@mantine/core";
import { useState, useEffect } from "react";

const TrainerConfig = ({ onChange, data }) => {
    const listOptimizers = ["SGD"];
    const [config, setConfig] = useState(data || {
        batch_size: 32,
        epochs: 3,
        n_epochs_not_improving: 5,
        tol: 0.0001,
        learning_rate: 0.01,
        optimizer: listOptimizers[0],
        early_stopping: false,
        evaluate_metrics: true,
        warm_start: false,
        validation_fraction: 0.1,
    });

    useEffect(() => {
        if (onChange) {
            onChange(config);
        }
    }, [config, onChange]);

    return (
        <Box>
            {/* Grupo 1: Configuración básica del entrenamiento */}
            <Box radius="md" mb="xl">
                <Text mb="md" size="lg" >Basic Configuration</Text>
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <NumberInput
                            label="Batch Size"
                            value={config.batch_size}
                            onChange={(value) => setConfig({ ...config, batch_size: value })}
                            min={1}
                            max={10000}
                            step={16}
                            withAsterisk
                            w="50%"
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <NumberInput
                            label="Number of Epochs"
                            value={config.epochs}
                            onChange={(value) => setConfig({ ...config, epochs: value })}
                            min={1}
                            max={10000}
                            withAsterisk
                            w="50%"

                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }} >
                        <NumberInput
                            label="Learning Rate"
                            value={config.learning_rate}
                            onChange={(value) => setConfig({ ...config, learning_rate: value })}
                            min={0.0001}
                            max={1}
                            step={0.0001}
                            precision={4}
                            withAsterisk
                            w="50%"
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <NumberInput
                            label="Validation Fraction"
                            value={config.validation_fraction}
                            onChange={(value) => setConfig({ ...config, validation_fraction: value })}
                            min={0}
                            max={0.5}
                            step={0.01}
                            precision={2}
                            w="50%"
                        />
                    </Grid.Col>
                </Grid>
            </Box>
            <Divider my="xl" />
            {/* Grupo 2: Optimización */}
            <Box shadow="sm" radius="md" mb="xl">
                <Text mb="md" size="lg">Optimizer Configuration</Text>
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                            label="Optimizer Algorithm"
                            value={config.optimizer}
                            onChange={(value) => setConfig({ ...config, optimizer: value })}
                            data={listOptimizers}
                            placeholder="Select one"
                            withAsterisk
                            searchable
                            w="50%"
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Group align="flex-end">
                            <NumberInput
                                label="Tolerance"
                                value={config.tol}
                                onChange={(value) => setConfig({ ...config, tol: value })}
                                min={0}
                                max={1}
                                step={0.001}
                                precision={3}
                                w="50%"
                            />
                        </Group>
                    </Grid.Col>
                </Grid>
            </Box>
            <Divider my="xl" />

            {/* Grupo 3: Early Stopping */}
            <Box  shadow="sm" radius="md" mb="xl">
                 <Text mb="md" size="lg">Early Stopping</Text>
                <Stack>
                    <Checkbox
                        label="Use Early Stopping"
                        description="Stop training when validation score is not improving"
                        checked={config.use_early_stopping}
                        onChange={(event) => setConfig({ ...config, use_early_stopping: event.currentTarget.checked })}
                        mb="sm"
                    />

                    {config.use_early_stopping && (
                        <Grid gutter="xl">
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <NumberInput
                                    label="Epochs Without Improvement"
                                    value={config.n_epochs_not_improving}
                                    onChange={(value) => setConfig({ ...config, n_epochs_not_improving: value })}
                                    min={1}
                                    max={100}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <NumberInput
                                    label="Minimum Improvement"
                                    value={config.tol}
                                    onChange={(value) => setConfig({ ...config, tol: value })}
                                    min={0}
                                    max={1}
                                    step={0.0001}
                                    precision={4}
                                />
                            </Grid.Col>
                        </Grid>
                    )}
                </Stack>
            </Box>
        </Box>
    );

};

export default TrainerConfig;
