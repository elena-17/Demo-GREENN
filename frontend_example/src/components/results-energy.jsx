import { Flex, Text, Table, Paper, Box, Title, Group, Card, SimpleGrid, ThemeIcon, Accordion, Stack, useMantineTheme, useMantineColorScheme, Button, ColorSwatch, Divider } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { LineChart, BarChart, DonutChart } from '@mantine/charts';
import '@mantine/charts/styles.css';
import { ResultService } from "../services/resultService";
import { Icons } from "../icons";
import { useMediaQuery } from "@mantine/hooks";
import { useEpochChartData } from "../hooks/useEpochChartData";
import { getContentByState } from "../hooks/getContentByState";
const ResultsEnergy = ({ state, testCaseID, measurer, metrics: metricsProp }) => {

    const theme = useMantineTheme();

    const [totalReport, setTotalReport] = useState(null);
    const [perEpochReport, setPerEpochReport] = useState(null);
    const [layerDetailReport, setLayerDetailReport] = useState(null);
    const [layerTotalReport, setLayerTotalReport] = useState(null);
    const [layerDetailChartData, setLayerDetailChartData] = useState(null);
    const [layerTotalChartData, setLayerTotalChartData] = useState(null);
    const [layerDetailKeys, setLayerDetailKeys] = useState([]);
    const [layerTotalKeys, setLayerTotalKeys] = useState([]);
    const [codecarbonInfo, setCodecarbonInfo] = useState(null);

    const donutKeys = ['duration', 'emissions', 'energy_consumed'];
    const { chartData, metricKeys, layers } = useEpochChartData(perEpochReport, metricsProp);
    const content = getContentByState(state);
    const [error, setError] = useState(null);
    const units = {
        'emissions': 'kg CO2eq',
        'cpu energy': 'kWh',
        'gpu energy': 'kWh',
        'ram energy': 'kWh',
        'energy consumed': 'kWh',
        'emissions rate': 'kg CO2eq/s',
        'duration': 's',
        'num passes': 'units',
        'epoch': 'units',
    };

    // Icon mapping
    const iconMap = {
        'emissions': <Icons.Cloud size={24} />,
        'cpu energy': <Icons.Cpu size={24} />,
        'gpu energy': <Icons.Gpu size={24} />,
        'ram energy': <Icons.Memory size={24} />,
        'energy consumed': <Icons.Energy size={24} />,
        'emissions rate': <Icons.Leaf size={24} />,
        'duration': <Icons.Clock size={24} />,
    };

    const colorMap = {
        'emissions': '#cc5de8',
        'cpu energy': '#1c7ed6',
        'gpu energy': '#1098ad',
        'ram energy': '#0ca678',
        'energy consumed': '#74b816',
        'emissions rate': '#fab005',
        'duration': '#f06595',
        'epoch': '#d9480f',
        'num passes': '#adb5bd',
    };

    const colors = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFC300', '#B980F0', '#FF9F1C', '#FFBF69', '#6A0572', '#D83367', '#F7B7A3'];


    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            if (state !== "success") {
                setTotalReport(null);
                setPerEpochReport(null);
                setLayerDetailReport(null);
                setLayerTotalReport(null);
                return;
            }
            try {
                const results = await ResultService.getResults(testCaseID);
                setTotalReport(results['TOTAL REPORT']);
                // epoch report
                setPerEpochReport(results['PER EPOCH REPORT TOTAL']);
                // layer report
                setLayerDetailReport(results["PER LAYER REPORT DETAIL"]);
                setLayerTotalReport(results["PER LAYER REPORT TOTAL"]);
                // codecarbon info
                setCodecarbonInfo(results["CODECARBON INFO"]);
            } catch (error) {
                console.error('Error fetching results:', error);
                setError("Failed to fetch results. Please try again later.");
            }
        };
        fetchData();
    }, [state, testCaseID]);


    useEffect(() => {
        if (!metricsProp.includes('layer')) return;
        if (!layerTotalReport || typeof layerTotalReport !== 'object') return;
        const keys = Object.keys(layerTotalReport).filter((key) => key !== 'layer');
        setLayerTotalKeys(keys);

        const layers = Object.keys(layerTotalReport[keys[0]] || {}).map(Number);
        const data = layers.map((layer) => {
            const entry = { layer };
            keys.forEach((key) => {
                entry[key] = layerTotalReport[key]?.[layer] ?? null;
            });
            entry['layer'] = layerTotalReport['layer']?.[layer] ?? 'layer' + layer;
            return entry;
        });
        setLayerTotalChartData(data);
    }, [layerTotalReport]);

    const shortenName = (fullName) => {
        return fullName
            .replace('Convolutional', 'Conv')
            .replace('Dense', 'Den')
            .replace('validation', 'Val')
            .replace('train', 'Tr')
            .replace('forward', 'Fwd')
            .replace('backward', 'Bwd')
    };
    const abbreviations = [
        { original: 'Convolutional', short: 'Conv' },
        { original: 'Dense', short: 'Den' },
        { original: 'validation', short: 'Val' },
        { original: 'train', short: 'Tr' },
        { original: 'forward', short: 'Fwd' },
        { original: 'backward', short: 'Bwd' },
    ];


    useEffect(() => {
        if (!metricsProp.includes('layer')) return;
        if (!layerDetailReport || typeof layerDetailReport !== 'object') return;

        const keys = Object.keys(layerDetailReport).filter((key) => key !== 'layer' && key !== 'type' && key !== 'direction');
        setLayerDetailKeys(keys);

        const layers = Object.keys(layerDetailReport[keys[0]] || {}).map(Number);
        const data = layers.map((layer) => {
            const entry = { layer };
            keys.forEach((key) => {
                entry[key] = layerDetailReport[key]?.[layer] ?? null;
            });

            const fullName = `${layerDetailReport['layer']?.[layer] || ''} ${layerDetailReport['type']?.[layer] || ''} ${layerDetailReport['direction']?.[layer] || ''}`.trim();
            entry['layerFullName'] = fullName;
            entry['layer'] = shortenName(fullName) || ('layer' + layer);

            return entry;
        });

        setLayerDetailChartData(data);
    }, [layerDetailReport]);



    const MetricCard = ({ metricKey, value }) => {
        const label = metricKey.replace(/_/g, ' ');
        const icon = iconMap[label] || <FaLeaf size={24} />;
        const customColor = colorMap[label] || '#000';
        return (
            <Card withBorder radius="md" p="md">
                <Group align="center" spacing="xs">
                    <ThemeIcon size={32} radius="md" variant="light" c={customColor}>{icon}</ThemeIcon>
                    <Text size="sm" c={customColor}>{label} ({units[label]})</Text>
                </Group>
                <Text weight={500} mt="xs">{value != null ? Number(value).toExponential(3) : '-'}</Text>
            </Card>
        );
    };


    const donutDataMap = useMemo(() => {
        if (!metricsProp.includes('layer') || !layerTotalChartData) return {};
        return donutKeys.reduce((acc, key) => {
            const total = layerTotalChartData.reduce((sum, entry) => sum + (entry[key] || 0), 0);

            const data = layerTotalChartData
                .filter((entry) => entry[key] > 0)
                .map((entry, index) => ({
                    name: entry.layer,
                    value: (entry[key] || 0),
                    color: colors[index % colors.length],
                }));
            acc[key] = data;
            return acc;
        }, {});
    }, [layerTotalChartData, testCaseID]);


    const renderTable = (obj) => (
        obj && Object.keys(obj).length > 0 && (
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
        )
    );

    if (error) {
        return (
            <Stack align="center" justify="center" mt="xl" mb="xl">
                <Icons.TimesCircle size={28} color="#f87171" />
                <Text size="lg" c="red.5" ta="center" mt="md">{error}</Text>
            </Stack>
        );
    }

    return (
        <Flex w="100%" mt="xl" direction="column" mb={100}>
            {state !== "success" && (
                content && (
                    <Stack align="center" justify="center" mt="xl" mb="xl">
                        {content.icon}
                        <Text size="lg" c={content.color} ta="center" mt="md">{content.text}</Text>
                    </Stack>
                )
            )}
            {state === 'success' && totalReport && (
                <>
                    <Group spacing="xl">
                        <Text><strong>Measurer:</strong> {measurer}</Text>
                        <Text><strong>Metrics:</strong> {metricsProp}</Text>
                    </Group>

                    {/* Total Report */}
                    <Box shadow="sm" radius="md" withBorder mt="lg" w="100%">
                        <Title order={3} mb="md">Total Report</Title>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                            {Object.entries(totalReport).map(([key, val]) => (
                                <MetricCard key={key} metricKey={key} value={val} />
                            ))}
                        </SimpleGrid>
                    </Box>

                    <Accordion variant="separated" mt="xl">
                        <Accordion.Item value="codecarbon information">
                            <Accordion.Control>Codecarbon Information</Accordion.Control>
                            <Accordion.Panel>
                                {renderTable(codecarbonInfo)}
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>

                    {metricsProp.includes('layer') && Object.entries(donutDataMap).length > 0 && (
                        <Box w="100%" mt="lg">
                            <Title order={4}>Layer Summary</Title>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                                {Object.entries(donutDataMap).map(([key, val]) => (
                                    <Card withBorder radius="md" p="xs">
                                        <DonutChart data={val} key={key} label={key} labelsType="percent" withLabels chartLabel={key} tooltipDataSource="segment" mx="auto"
                                        />
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}
                    {/* Per Epoch Metrics */}
                    {metricKeys.length > 0 && metricsProp.includes('epoch') && (
                        <Box mt={50} maw={900} w="100%">
                            <Title order={3} mb="md">Per Epoch Metrics</Title>

                            <SimpleGrid cols={1} spacing="md">
                                {metricKeys.map((key) => {
                                    const label = key.replace(/_/g, ' ');
                                    return (
                                        <Card withBorder key={key} mb="lg">
                                            <Title order={5} mb="xs"
                                                c={colorMap[label] || '#000'}
                                            >{label} ({units[label]})</Title>
                                            <LineChart
                                                h={200}
                                                data={chartData}
                                                dataKey="epoch"
                                                series={[{ name: key, color: colorMap[label] || '#000' }]}
                                                curveType="linear"
                                                lineChartProps={{ syncId: 'sync-loss' }}
                                            />
                                        </Card>
                                    );
                                })}
                            </SimpleGrid>
                        </Box>
                    )}
                    {metricsProp.includes('layer') && (
                        <Box mt={50} maw={900} w="100%">
                            <Title order={3} mb="md">Detailed Reports</Title>
                            <Accordion variant="separated" multiple>
                                <Accordion.Item value="epoch">
                                    <Accordion.Control>Per Epoch Report</Accordion.Control>
                                    <Accordion.Panel>
                                        <Text size="md" mb="xs" fw={700} >Legend:</Text>
                                        <SimpleGrid cols={4} spacing="md" mb="xl">
                                            {layers.map((layerName, index) => (
                                                <Flex key={layerName} display="flex" align="center" gap="xs">
                                                    <ColorSwatch
                                                        color={colors[index % colors.length]}
                                                        size={15}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => {
                                                            const layerData = chartData.filter(item =>
                                                                Object.keys(item).some(k => k.endsWith(layerName))
                                                            );
                                                            //console.log(`Layer ${layerName} data:`, layerData);
                                                        }}
                                                    />
                                                    <Text size="sm">{layerName}</Text>
                                                </Flex>
                                            ))}
                                        </SimpleGrid>

                                        {metricKeys.map((key) => {
                                            const label = key.replace(/_/g, ' ');
                                            const series = layers.map((layer, i) => ({
                                                name: `${key}_${layer}`,
                                                color: colors[i % colors.length],
                                                label: layer,
                                            }))
                                            return (
                                                <Card  key={key} mb="xl" p="md">
                                                    <Title order={5} mb="xs"
                                                        c={colorMap[label] || '#000'}
                                                    >{label} ({units[label]})</Title>
                                                    <LineChart
                                                        h={200}
                                                        data={chartData}
                                                        dataKey="epoch"
                                                        series={series}
                                                        curveType="linear"
                                                    // lineChartProps={{ syncId: 'sync-loss' }}
                                                    //withLegend
                                                    />

                                                </Card>
                                            );
                                        })}
                                    </Accordion.Panel>
                                </Accordion.Item>
                                <Accordion.Item value="layer-total">
                                    <Accordion.Control>Per Layer Report Total</Accordion.Control>
                                    <Accordion.Panel>
                                        {layerTotalKeys.length > 0 &&
                                            layerTotalKeys.map((key) => {
                                                const label = key.replace(/_/g, ' ');
                                                return (
                                                    <Card key={key} mb="xl" p="md">
                                                        <Title order={5} mb="xs"
                                                            c={colorMap[label] || '#000'}
                                                        >{label} ({units[label]}) </Title>

                                                        <BarChart
                                                            h={200}
                                                            data={layerTotalChartData}
                                                            dataKey="layer"
                                                            series={[{ name: key, color: colorMap[label] || '#000' }]}
                                                            curveType="linear"
                                                            lineChartProps={{ syncId: 'sync-layer-total' }}
                                                        />
                                                    </Card>
                                                );
                                            })
                                        }

                                    </Accordion.Panel>
                                </Accordion.Item>
                                <Accordion.Item value="layer-detail">
                                    <Accordion.Control>Per Layer Report Detail</Accordion.Control>
                                    <Accordion.Panel>
                                        <Text size="md" mb="md" fw={700} >Legend:</Text>
                                        <Table withTableBorder verticalSpacing="xs" horizontalSpacing="xs" mb="md"  >

                                            <Table.Tbody style={{ fontSize: '0.8rem' }}>
                                                <Table.Tr>
                                                    <Table.Td fw={700}>Full name</Table.Td>
                                                    {abbreviations.map((item, index) => (
                                                        <Table.Td key={`name-${index}`}>{item.original}</Table.Td>
                                                    ))}
                                                </Table.Tr>
                                                <Table.Tr>
                                                    <Table.Td fw={700}>Abbreviation</Table.Td>
                                                    {abbreviations.map((item, index) => (
                                                        <Table.Td key={`abbr-${index}`}>{item.short}</Table.Td>
                                                    ))}
                                                </Table.Tr>
                                            </Table.Tbody>
                                        </Table>

                                        {layerDetailKeys.length > 0 &&
                                            layerDetailKeys.map((key) => {
                                                const label = key.replace(/_/g, ' ');
                                                return (
                                                    <Card key={key} mb="xl" p="md">
                                                        <Title order={5} mb="xs"
                                                            c={colorMap[label] || '#000'}
                                                        >{label} ({units[label]})</Title>
                                                        <BarChart
                                                            h={200}
                                                            data={layerDetailChartData}
                                                            dataKey="layer"
                                                            series={[{ name: key, color: colorMap[label] || '#000' }]}
                                                            curveType="linear"
                                                            lineChartProps={{ syncId: 'sync-layer-total' }}

                                                        />
                                                    </Card>
                                                );
                                            })
                                        }

                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                        </Box>
                    )}
                </>
            )}
        </Flex>
    );
};

export default ResultsEnergy;
