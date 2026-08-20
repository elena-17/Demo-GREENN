import { Card, Text, Progress, Group, Loader, Flex, ThemeIcon, Box } from "@mantine/core";
import { Icons } from "../icons";
import CnnProgress from "./cnn-progress";

import { useEffect, useRef, useState } from "react";

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

const CnnLoader = ({ loading, total, progressState }) => {

    const percentage = progressState.percentage;
    const previous = usePrevious(percentage);
    const goingBackward = previous !== undefined && percentage < previous;

    return (
        <Card m={0} withBorder>
            <Text size="lg" mb="xs" fw={700}>TestCase Progress</Text>
            <Group position="center" direction="column" spacing="xs">
                {loading ? (
                    <Flex direction="row" align="center" justify="center" gap="xs">
                        <Loader size="xl" type="dots" />
                        <Text size="lg" mb="xs">Loading Dataset</Text>
                        <Loader size="xl" type="dots" />
                    </Flex>
                ) : (
                    <Flex direction="column" gap="xs" w="100%">
                        <Group gap="xl" p="md" justify="space-around" align="center">
                            <Text size="xl" fw={700} style={{
                                minWidth: "120px",  // Ancho fijo suficiente para "Epoch 100/100"
                                textAlign: "center" // Centrado para evitar saltos
                            }} >Epoch {progressState.epoch}/{total}</Text>
                            <Box style={{ flex: 1 }}>
                                <CnnProgress totalEpochs={total} currentEpoch={progressState.epoch} />
                            </Box>
                            <Text size="lg" style={{
                                minWidth: "180px",  // Suficiente para "Progress Batches: 100%"
                                textAlign: "center"
                            }}>Progress Batches: {Math.floor(progressState.percentage)}%</Text>
                        </Group>
                        <Progress.Root
                            size="xxl"
                            mt="md"
                            color="blue"
                            radius="md"
                            style={{
                                backgroundColor: "var(--mantine-color-gray-4)",
                                width: "100%",
                                transition: "background-color 0.2s"
                            }}
                        >
                            <Progress.Section
                                value={progressState.percentage}
                                animated
                                style={{
                                    transition: goingBackward ? "none" : "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                                }}
                            >
                                <Progress.Label>{progressState.percentage}%</Progress.Label>
                            </Progress.Section>
                        </Progress.Root>
                        {/* <Group position="apart" mt="xs">
                            <Text size="xs">Elapsed: {progressState.elapsed}</Text>
                            <Text size="xs">Remaining: {progressState.remaining}</Text>
                            <Text size="xs">Speed: {progressState.speed}</Text>
                        </Group> */}
                        {/* <Flex justify="center" align="center" mt="md">
                        </Flex> */}
                    </Flex>
                )}
            </Group>
        </Card>
    );
};
export default CnnLoader;
