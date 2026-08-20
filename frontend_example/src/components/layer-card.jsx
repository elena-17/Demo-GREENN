import { Card, Flex, Text, Tooltip, Stack, Group, Badge, ActionIcon, useMantineColorScheme } from "@mantine/core";
import reluSvg from "../assets/relu.svg";
import sigmoidSvg from "../assets/sigmoid.svg";
import tanhSvg from "../assets/tanh.svg";
import linearSvg from "../assets/linear.svg";
import { useMantineTheme } from "@mantine/core";
import { Icons } from "../icons";

const LayerCard = ({ layer, onEdit, onDelete }) => {
    const { colorScheme } = useMantineColorScheme();

    const { type, neurons, activation, flatten, dropout, kernel_size } = layer;

    const theme = useMantineTheme();
    const typeColors = {
        convolutional: {
            bg: colorScheme === 'light' ? theme.colors.blue[1] : theme.colors.blue[9],
            border: colorScheme === 'light' ? theme.colors.blue[6] : theme.colors.blue[4],
            text: colorScheme === 'light' ? theme.colors.blue[8] : theme.colors.blue[1]
        },
        dense: {
            bg: colorScheme === 'light' ? theme.colors.grape[1] : theme.colors.grape[9],
            border: colorScheme === 'light' ? theme.colors.grape[6] : theme.colors.grape[4],
            text: colorScheme === 'light' ? theme.colors.grape[8] : theme.colors.grape[1]
        }
    };

    const ActivationIcon = activation === "relu"
        ? reluSvg
        : activation === "sigmoid"
            ? sigmoidSvg
            : activation === "tanh"
                ? tanhSvg
                : activation === "linear"
                    ? linearSvg
                    : null;

    const svgFilter = colorScheme === 'light' ?
        'invert(18%) sepia(13%) saturate(1413%) hue-rotate(183deg) brightness(93%) contrast(88%)' :
        'invert(96%) sepia(5%) saturate(437%) hue-rotate(183deg) brightness(115%) contrast(85%)';

    const cardStyle = {
        backgroundColor: typeColors[type]?.bg || (colorScheme === 'light' ? theme.colors.gray[0] : theme.colors.dark[7]),
        borderLeft: `4px solid ${typeColors[type]?.border || (colorScheme === 'light' ? theme.colors.gray[4] : theme.colors.dark[4])}`,
        transition: 'all 0.2s ease',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: colorScheme === 'light' ? theme.shadows.md : theme.shadows.xl
        }
    };

    return (
        <Card withBorder shadow="md" radius="md" style={cardStyle}>
            <Flex justify="space-between" align="center">
                <Stack spacing={4}>
                    <Text fw={600} size="md" c={colorScheme === 'light' ? 'black' : 'white'}>
                        {type.toUpperCase()}
                    </Text>
                    <Group spacing="xs">
                        <Badge color="red" variant="filled">Neurons: {neurons}</Badge>
                        {typeof kernel_size !== 'undefined' && kernel_size > 0 && (
                            <Badge color="orange" variant="white">Kernel: {kernel_size}</Badge>
                        )}
                        {flatten && (
                            <Badge color="grape" variant="white">Flatten</Badge>
                        )}
                        {dropout > 0 && (
                            <Badge color="green" variant="white">Dropout: {dropout}</Badge>
                        )}
                    </Group>
                </Stack>

                <Group>
                    {ActivationIcon && (
                        <Tooltip label={`Activation: ${activation}`}>
                            <div style={{
                                filter: svgFilter,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <img
                                    src={ActivationIcon}
                                    alt={`${activation} activation`}
                                    width={38}
                                    height={38}
                                />
                            </div>
                        </Tooltip>
                    )}
                    <ActionIcon variant="subtle" color="black" onClick={onEdit}>
                        <Icons.Edit size={18} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" onClick={onDelete} style={{ color: theme.colors.red[5] }}>
                        <Icons.Delete size={18} />
                    </ActionIcon>
                </Group>
            </Flex>
        </Card>
    );
};

export default LayerCard;
