import { useForm } from '@mantine/form';
import { Button, NumberInput, Select, Checkbox, Stack } from '@mantine/core';

const LayerConfig = ({ initialValues = {}, onSave }) => {
    const listLayerTypes = ['convolutional', 'dense'];
    const listWeightInit = ['standard', 'glorot'];
    const listActivationFunctions = ['linear', 'relu', 'sigmoid', 'tanh'];


    const form = useForm({
        initialValues: {
            type: initialValues.type || '',
            activation: initialValues.activation || listActivationFunctions[0],
            kernel_size: initialValues.kernel_size || 3,
            dropout: initialValues.dropout || 0,
            weight_init: initialValues.weight_init || listWeightInit[0],
            flatten: initialValues.flatten || false,
            neurons: initialValues.neurons || '',
        },
        validate: {
            type: (value) => (value ? null : 'Select a layer type'),
            activation: (value) => (value ? null : 'Select an activation function'),
            kernel_size: (value, values) =>
                values.type === 'convolutional' && !value ? 'Introduce kernel size' : null,
            dropout: (value, values) =>
                values.type === 'convolutional' && (value === '' || value < 0 || value > 1)
                    ? 'Introduce a value between 0 and 1'
                    : null,
            neurons: (value) =>
                !value ? 'Input neurons value' : null,
        },
    });

    const handleSubmit = (values) => {
        //console.log('Datos de la capa:', values);
        onSave(values);
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="xs">
                <Select
                    label="Layer type"
                    placeholder="Select a layer type"
                    data={listLayerTypes}
                    {...form.getInputProps('type')}
                />

                {/* Renderiza campos específicos según el tipo */}
                {form.values.type === 'convolutional' && (
                    <>
                        <NumberInput
                            label="Kernel Size"
                            placeholder="Kernel size"
                            min={1}
                            allowNegative={false}
                            {...form.getInputProps('kernel_size')}
                        />
                        <Checkbox
                            label="Flatten"
                            labelPosition='left'
                            {...form.getInputProps('flatten', { type: 'checkbox' })}
                        />
                    </>
                )}
                <NumberInput
                    label="Dropout"
                    placeholder="Dropout value"
                    min={0}
                    max={1}
                    step={0.1}
                    allowNegative={false}
                    {...form.getInputProps('dropout')}
                />
                <NumberInput
                    label="Neurons"
                    placeholder="Number of neurons"
                    allowNegative={false}
                    {...form.getInputProps('neurons')}
                />
                <Select
                    label="Weight Init"
                    placeholder="Select a weight initialization"
                    data={listWeightInit}
                    {...form.getInputProps('weight_init')}
                />
                <Select
                    label="Activation function"
                    placeholder="Select an activation function"
                    data={listActivationFunctions}
                    {...form.getInputProps('activation')}
                />

                <Button type="submit">Save</Button>
            </Stack>
        </form>
    );
};
export default LayerConfig;
