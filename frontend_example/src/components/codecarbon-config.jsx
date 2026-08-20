import {
    Flex, Text, NumberInput
} from "@mantine/core";

const CodecarbonConfig = ({ config, setConfig }) => {
    const handleInputChange = (value) => {
        const parsed = typeof value === 'number' ? value : parseFloat(value);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 60) {
            setConfig({ ...config, measure_interval: parsed });
        }
    };

    return (
        <>
            <Text size="md" mb="md">CodeCarbon</Text>
            <Flex direction="column" gap="md">
                <NumberInput
                    label="Measure interval (seconds)"
                    min={1}
                    max={60}
                    step={1}
                    value={config.measure_interval ?? ''}
                    onChange={handleInputChange}
                />
            </Flex>
        </>
    );
};

export default CodecarbonConfig;
