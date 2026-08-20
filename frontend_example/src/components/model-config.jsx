import {
    Button, Flex, Group, Grid, MultiSelect, Text, Radio, Card, NumberInput
} from "@mantine/core";
import { useState, useEffect } from "react";
import { modals } from '@mantine/modals';

import LayerConfig from "./layer-config";
import CnnBuilder from "./cnn-builder";
import { Icons } from "../icons";

const ModelConfig = ({ onChange, data, onValidationChange, datasetClasses }) => {
    const [errorLayers, setErrorLayers] = useState("");

    const isEmpty = Object.keys(data || {}).length === 0;

    const [modelConfig, setModelConfig] = useState(
        isEmpty
            ? {
                seed: Math.floor(Math.random() * 10000),
                loss: "SoftmaxCrossEntropy",
                metrics: [],
                layers: [{
                    id: 1,
                    type: "dense",
                    dropout: 0,
                    flatten: false,
                    neurons: datasetClasses,
                    activation: "linear",
                    kernel_size: 0,
                    weight_init: "glorot"
                }]
            }
            : data
    );

    useEffect(() => {
        onChange(modelConfig);
        const hasLayers = modelConfig.layers.length > 0;
        onValidationChange?.(hasLayers, hasLayers ? "" : "At least one layer is required");
        onValidationChange?.(validateLayers(), errorLayers || "");
    }, [modelConfig, onChange]);

    const validateLayers = () => {
        if (modelConfig.layers.length === 0) {
            setErrorLayers("ERROR. You must add at least one layer.");
            return false;
        }
        if (modelConfig.layers[modelConfig.layers.length - 1].type !== "dense") {
            setErrorLayers("ERROR. The last layer must be a dense layer.");
            return false;
        }

        if (modelConfig.layers[modelConfig.layers.length - 1].neurons !== datasetClasses) {
            setErrorLayers(`ERROR. The last layer must have ${datasetClasses} neurons, same as the number of classes in the dataset.`);
            return false;
        }

        for (let i = 0; i < modelConfig.layers.length - 1; i++) {
            const currentLayer = modelConfig.layers[i];
            const nextLayer = modelConfig.layers[i + 1];

            // Check for convolutional -> dense without flatten
            if (
                currentLayer.type === "convolutional" &&
                nextLayer.type === "dense" &&
                !currentLayer.flatten
            ) {
                setErrorLayers("ERROR. A convolutional layer must be flattened before a dense layer.");
                return false;
            }

            // Check for dense -> convolutional without flatten
            if (
                currentLayer.type === "dense" &&
                nextLayer.type === "convolutional" &&
                currentLayer.flatten
            ) {
                setErrorLayers("ERROR. A dense layer cannot be followed by a convolutional layer.");
                return false;
            }
        }
        setErrorLayers("");
        return true;
    }

    useEffect(() => {
        validateLayers();
    }, [modelConfig.layers]);


    const handleDelete = (row) => {
        setModelConfig(prev => {
            const newLayers = prev.layers.filter(layer => layer.id !== row.id);
            return {
                ...prev,
                layers: newLayers,
            };
        });
    };

    const handleAddLayer = (initialData = {}) => {
        modals.open({
            title: 'Configure a model layer',
            children: (
                <LayerConfig
                    initialValues={initialData}
                    onSave={(newLayer) => {
                        setModelConfig(prev => ({
                            ...prev,
                            layers: [...prev.layers, { id: prev.layers.length + 1, ...newLayer }]
                        }));
                        modals.closeAll();
                    }}
                />
            ),
        });
    };

    const handleEdit = (row) => {
        modals.open({
            title: 'Edit Layer',
            children: (
                <LayerConfig
                    initialValues={row}
                    onSave={(newLayer) => {
                        setModelConfig(prev => ({
                            ...prev,
                            layers: prev.layers.map(layer => layer.id === row.id ? { ...layer, ...newLayer } : layer)
                        }));
                        modals.closeAll();
                    }}
                />
            ),
        });
    };

    return (
        <Grid gutter="xl" align="flex-end">
            {/* Primera fila: Configuraciones básicas */}
            <Grid.Col span={{ base: 12, md: 7 }}>
                <NumberInput
                    label="Random Seed"
                    placeholder="Ej: 42"
                    description="Seed for random number generation"
                    value={String(modelConfig.seed)}
                    onChange={(value) => setModelConfig(prev => ({ ...prev, seed: value }))}
                    size="md"
                    w="85%"
                    allowNegative={false}
                    allowDecimal={false}
                />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 7 }}>
                <MultiSelect
                    w="85%"
                    hidePickedOptions
                    data={["accuracy", "f1", "precision", "recall"]}
                    label="Evaluation Metrics"
                    description="Select the metrics to evaluate the model"
                    placeholder="Ej: accuracy, f1"
                    clearable
                    searchable
                    value={modelConfig.metrics}
                    onChange={(selectedMetrics) => setModelConfig(prev => ({ ...prev, metrics: selectedMetrics }))}
                    size="md"
                />
            </Grid.Col>

            {/* Segunda fila: Función de pérdida */}
            <Grid.Col span={12}>
                <Radio.Group
                    value={modelConfig.loss}
                    onChange={(value) => setModelConfig(prev => ({ ...prev, loss: value }))}
                    name="loss"
                    label="Loss Function"
                    description="Select the loss function for the model"
                    size="md"
                >
                    <Flex gap="xl" mt="sm" wrap="wrap">
                        <Radio value="MeanSquaredError" label="Mean Squared Error" />
                        <Radio value="SoftmaxCrossEntropy" label="Softmax Cross Entropy" />
                    </Flex>
                </Radio.Group>
            </Grid.Col>

            {/* Tercera fila: Configuración de capas */}
            <Grid.Col span={12}>
                <Card
                    mt="xl"
                    p="md"
                    withBorder
                    style={{
                        borderColor: errorLayers ? 'red' : undefined,
                    }}
                >
                    <Group justify="space-between" mb="md">
                        <Text size="lg" fw={600}>Layer Configuration</Text>
                        <Button
                            onClick={() => handleAddLayer()}
                            variant="outline"
                            leftSection={<Icons.Plus size={16} />}
                            size="sm"
                        >
                            Add Layer
                        </Button>
                    </Group>
                    <Text size="sm" c="red" mb="md">
                        {errorLayers}
                    </Text>

                    <CnnBuilder
                        layers={modelConfig.layers}
                        onChange={(layers) => setModelConfig(prev => ({ ...prev, layers }))}
                        onEditLayer={(layer) => handleEdit(layer)}
                        onDeleteLayer={(layer) => handleDelete(layer)}
                    />
                </Card>
            </Grid.Col>
        </Grid>
    );
};


export default ModelConfig;
