import { Flex, Text, Stack, Box, Title, Group, Button, Card, Select, Tabs, Paper, Tooltip, Grid, SegmentedControl, MultiSelect, SimpleGrid, Loader } from "@mantine/core";
import { LineChart, AreaChart, ScatterChart } from '@mantine/charts';
import { ResultService } from "../services/resultService";
import { useEffect, useState } from "react";
import { Icons } from "../icons";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { useEpochChartData } from "../hooks/useEpochChartData";
import { getContentByState } from "../hooks/getContentByState";


// Configuración de métricas
const PERFORMANCE_METRICS = [
    { value: 'train_loss', label: 'Training Loss', color: '#fd7e14', icon: <Icons.TrendDown /> },
    { value: 'val_loss', label: 'Validation Loss', color: '#228be6', icon: <Icons.TrendDown /> },
    { value: 'train_accuracy', label: 'Training Accuracy', color: '#82c91e', icon: <Icons.TrendUp /> },
    { value: 'val_accuracy', label: 'Validation Accuracy', color: '#4dabf7', icon: <Icons.TrendUp /> },
    { value: 'train_f1', label: 'Training F1 Score', color: '#94d82d', icon: <Icons.TrendUp /> },
    { value: 'val_f1', label: 'Training F1 Score', color: '#94d82d', icon: <Icons.TrendUp /> },
];

const ENERGY_METRICS = [
    { value: 'total_energy', label: 'Total Energy', color: '#74b816', icon: <Icons.Energy />, unit: 'kWh' },
    { value: 'epoch_energy', label: 'Energy per Epoch', color: '#1c7ed6', icon: <Icons.Cpu />, unit: 'kWh' },
    { value: 'layer_energy', label: 'Energy per Layer', color: '#1098ad', icon: <Icons.Eye />, unit: 'kWh' },
    { value: 'emissions', label: 'CO2 Emissions', color: '#cc5de8', icon: <Icons.Cloud />, unit: 'kg CO2eq' },
    { value: 'emissions_rate', label: 'Emissions Rate', color: '#fab005', icon: <Icons.Leaf />, unit: 'kg CO2eq/s' },
];

const ResultsCompare = ({ testCaseID, state, metrics }) => {
    const [trainingData, setTrainingData] = useState([]);

    const [selectedPerfMetric, setSelectedPerfMetric] = useState([]);
    const [selectedEnergyMetric, setSelectedEnergyMetric] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [availablePerfMetrics, setAvailablePerfMetrics] = useState([]);
    const [totalReport, setTotalReport] = useState(null);
    const [perEpochReport, setPerEpochReport] = useState(null);
    const [error, setError] = useState(null);
    const { chartData, metricKeys, layers } = useEpochChartData(perEpochReport, metrics);
    const content = getContentByState(state);

    const colors = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFC300', '#B980F0', '#FF9F1C', '#FFBF69', '#6A0572', '#D83367', '#F7B7A3'];
    const PERF_METRICS = [
        { value: 'train_loss', label: 'Training Loss', color: '#1098ad' },
        { value: 'val_loss', label: 'Validation Loss', color: '#1098ad' },
        { value: 'train_accuracy', label: 'Training Accuracy', color: '#f06595' },
        { value: 'val_accuracy', label: 'Validation Accuracy', color: '#f06595' },
        { value: 'train_f1', label: 'Training F1 Score', color: '#cc5de8' },
        { value: 'val_f1', label: 'Validation F1 Score', color: '#cc5de8' },
        { value: 'train_precision', label: 'Training Precision', color: '#1c7ed6' },
        { value: 'val_precision', label: 'Validation Precision', color: '#1c7ed6' },
        { value: 'train_recall', label: 'Training Recall', color: '#74b816' },
        { value: 'val_recall', label: 'Validation Recall', color: '#74b816' },
    ];

    const ENERGY_METRICS = [
        { value: 'emissions', label: 'CO2 Emissions', color: '#cc5de8', unit: 'kg CO2eq' },
        { value: 'cpu_energy', label: 'CPU Energy', color: '#1c7ed6', unit: 'kWh' },
        { value: 'gpu_energy', label: 'GPU Energy', color: '#1098ad', unit: 'kWh' },
        { value: 'ram_energy', label: 'RAM Energy', color: '#0ca678', unit: 'kWh' },
        { value: 'energy_consumed', label: 'Total Energy Consumed', color: '#74b816', unit: 'kWh' },
        { value: 'emissions_rate', label: 'Emissions Rate', color: '#fab005', unit: 'kg CO2eq/s' },
        { value: 'duration', label: 'Duration', color: '#f06595', unit: 's' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            if (state !== "success") {
                setTotalReport(null);
                setPerEpochReport(null);
                setTrainingData([]);
                return;
            }
            try {
                setIsLoading(true);
                const response = await ResultService.getResults(testCaseID);
                setTrainingData(processTrainingData(response["training_data"]));
                processEnergyData(response);
            } catch (error) {
                console.error("Error fetching training results:", error);
                setError("Failed to fetch results. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [testCaseID]);

    const processTrainingData = (data) => {
        const keys = data['train_loss'];
        const chartData = Object.keys(keys).map((epoch) => {
            const entry = { epoch: Number(epoch) };
            PERF_METRICS.forEach(metric => {
                const metricKey = metric.value;
                entry[metricKey] = data[metricKey]?.[epoch] ?? null;
                const alreadyIncluded = availablePerfMetrics.some(m => m.value === metric.value);

                if (entry[metricKey] !== null && !alreadyIncluded) {
                    availablePerfMetrics.push({
                        value: metric.value,
                        label: metric.label
                    });
                }
            });

            return entry;
        });
        return chartData;
    };

    const processEnergyData = (data) => {
        setTotalReport(data['TOTAL REPORT']);
        setPerEpochReport(data['PER EPOCH REPORT TOTAL']);
    };

    const renderSummaryCards = (isPerf) => {
        const lastEpoch = trainingData[trainingData.length - 1];
        const perf = PERF_METRICS.filter(m =>
            selectedPerfMetric.includes(m.value)
        );
        const energy = ENERGY_METRICS.filter(m =>
            selectedEnergyMetric.includes(m.value)
        );
        if (!lastEpoch) return null;
        if (isPerf && (!perf || perf.length == 0)) return null;
        if (!isPerf && (!energy || energy.length == 0)) return null;
        return (
            <Card withBorder p="md" mb="xl" radius="lg">
                <Box>
                    {isPerf && perf.map((metric) => (
                        <Card key={metric.value} withBorder mb="md">
                            <Text size="sm" c="dimmed">{metric.label}</Text>
                            <Text size="lg" fw={700} >
                                {lastEpoch[metric.value] ? lastEpoch[metric.value].toFixed(4) : 'N/A'}
                            </Text>
                        </Card>
                    ))}
                    {!isPerf && energy.map((metric) => (
                        <Card key={metric.value} withBorder mb="md">
                            <Text size="sm" c="dimmed">{metric.label}</Text>
                            <Text size="lg" fw={700}>
                                {totalReport[metric.value] ? Number(totalReport[metric.value]).toExponential(3) : '0'} {metric.unit}
                            </Text>
                        </Card>
                    ))}
                </Box>
            </Card>

        );
    };

    const renderMixedChart = (isPerf) => {
        const perf = PERF_METRICS.filter(m => selectedPerfMetric.includes(m.value));
        const energy = ENERGY_METRICS.filter(m => selectedEnergyMetric.includes(m.value));
        if (isPerf && (!perf || perf.length == 0)) return null;
        if (!isPerf && (!energy || energy.length == 0)) return null;
        const collectedMetrics = isPerf ? perf : energy;
        let series = collectedMetrics.map((metric) => ({
            name: metric.value,
            color: metric.color,
            label: metric.label,
            dataKey: metric.value,
        }));
        if (metrics.includes('layer') && !isPerf) {
            series = collectedMetrics.flatMap((metric) =>
                layers.map((layer, i) => ({
                    name: `${metric.value}_${layer}`,
                    color: colors[i % colors.length],
                    label: layer,
                    dataKey: `${metric.value}_${layer}`,
                }))
            );
        }
        if (metrics.includes('total')) {
            return null; // No total metric for mixed charts
        }
        //console.log(metrics);
        const data = isPerf ? trainingData : chartData;
        return (
            <Card withBorder p="md" mb="xl" radius="lg">
                <Title order={5} mb="sm">{isPerf ? "Performance" : "Energy"}</Title>
                <Box id="combined-chart" w="100%" h="100%">
                    <LineChart
                        h={300}
                        data={data}
                        dataKey="epoch"
                        series={series}
                        curveType="linear"
                        withLegend
                        legendProps={{ verticalAlign: 'bottom' }}
                        valueFormatter={(value) =>
                            isPerf
                                ? (Number(value)?.toFixed(4) || 'N/A')
                                : (Number(value)?.toExponential(3) || 'N/A')
                        }
                        lineChartProps={{ syncId: 'sync-loss' }}
                    />
                </Box>
            </Card>
        );
    };


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
            {state === "success" && (

                <Box>
                    <Title order={3} mb="xl">Performance vs Energy Consumption</Title>
                    <SimpleGrid cols={{ base: 1, md: 2 }} mb="xl">
                        <Stack gap={0}>
                            <Text mb="xs">Performance Metrics</Text>
                            <MultiSelect
                                placeholder="Choose performance metrics"
                                data={availablePerfMetrics}
                                value={selectedPerfMetric}
                                onChange={setSelectedPerfMetric}
                                clearable
                                searchable
                                maxValues={5}
                                mb="xl"
                            />
                            {renderSummaryCards(true)}
                        </Stack>
                        <Stack gap={0}>
                            <Text mb="xs">Energy Metrics</Text>
                            <MultiSelect
                                placeholder="Choose energy metric"
                                data={ENERGY_METRICS.map(m => ({
                                    value: m.value,
                                    label: m.label
                                }))}
                                value={selectedEnergyMetric}
                                onChange={setSelectedEnergyMetric}
                                clearable
                                searchable
                                mb="xl"
                                maxValues={1}
                            />
                            {renderSummaryCards(false)}
                        </Stack>
                    </SimpleGrid>
                    {renderMixedChart(true)}
                    {renderMixedChart(false)}
                </Box>
            )}
        </Flex >
    );
};

export default ResultsCompare;
