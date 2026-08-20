import {
    Flex, Text, Stack, Box, Title, Group, Button, Loader, Tooltip, Card, SimpleGrid, MultiSelect, Paper, Tabs, Divider
} from "@mantine/core";
import { LineChart } from '@mantine/charts';

import { ResultService } from "../services/resultService";
import { useEffect, useState, useRef } from "react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toPng } from 'html-to-image';
import { Icons } from "../icons";
import { saveAs } from 'file-saver';
import { getContentByState } from "../hooks/getContentByState";
import { notifications } from "@mantine/notifications";

const Results = ({ state, testCaseID }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMetrics, setSelectedMetrics] = useState(['train_loss', 'val_loss']);
    const [activeTab, setActiveTab] = useState('custom');

    const [error, setError] = useState(null);
    const [keysAvailable, setKeysAvailable] = useState([]);
    const content = getContentByState(state);
    const METRICS = [
        { value: 'train_loss', label: 'Training Loss', color: '#99e9f2' },
        { value: 'val_loss', label: 'Validation Loss', color: '#1098ad' },
        { value: 'train_accuracy', label: 'Training Accuracy', color: '#faa2c1' },
        { value: 'val_accuracy', label: 'Validation Accuracy', color: '#f06595' },
        { value: 'train_f1', label: 'Training F1 Score', color: '#e599f7' },
        { value: 'val_f1', label: 'Validation F1 Score', color: '#cc5de8' },
        { value: 'train_precision', label: 'Training Precision', color: '#74c0fc' },
        { value: 'val_precision', label: 'Validation Precision', color: '#1c7ed6' },
        { value: 'train_recall', label: 'Training Recall', color: '#c0eb75' },
        { value: 'val_recall', label: 'Validation Recall', color: '#74b816' },
    ];



    useEffect(() => {
        const fetchData = async () => {
            if (state !== "success") {
                return;
            }
            setIsLoading(true);
            try {
                const results = await ResultService.getTrainingResults(testCaseID);
                const keys = results['train_loss'];
                const chartData = Object.keys(keys).map((epoch) => {
                    const entry = { epoch: Number(epoch) };

                    // Agregar todas las métricas disponibles
                    METRICS.forEach(metric => {
                        const metricKey = metric.value;
                        entry[metricKey] = results[metricKey]?.[epoch] ?? null;
                        if (entry[metricKey] !== null && !keysAvailable.includes(metricKey)) {
                            keysAvailable.push(metricKey);
                        }
                    });

                    return entry;
                });
                setData(chartData);
            } catch (error) {
                console.error("Error fetching training results:", error);
                setError("Failed to fetch results. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [state, testCaseID]);

    const downloadReport = async () => {
        try {
            const response = await ResultService.downloadTrainingResults(testCaseID);
            if (!response) {
                notifications.show({
                    title: "Download Failed",
                    message: "No response received for the download. Please try again later.",
                    color: "red",
                });
                console.error("No response received for download.");
                return;
            }
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${testCaseID}_training_results.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            notifications.show({
                title: "Download Failed",
                message: "An error occurred while downloading the report. Please try again later.",
                color: "red",
            });
            console.error("Error downloading report:", error);
        }
    }

    const exportAllChartsToPDF = async (chartIds) => {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
        });

        for (let i = 0; i < chartIds.length; i++) {
            const id = chartIds[i];
            const element = document.getElementById(id);
            if (!element) continue;

            try {
                const dataUrl = await toPng(element, {
                    cacheBust: true,
                    pixelRatio: 3, // mejora la calidad de imagen
                });

                const imgProps = pdf.getImageProperties(dataUrl);
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = 40;

                // Ajustar el gráfico a una proporción buena
                const imgWidth = pageWidth - margin * 2;
                const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

                if (i !== 0) pdf.addPage();

                pdf.setFontSize(14);
                pdf.text(id.replace(/-chart$/, '').replace(/-/g, ' ').toUpperCase(), margin, 40);

                pdf.addImage(
                    dataUrl,
                    'PNG',
                    margin,
                    60,
                    imgWidth,
                    imgHeight > pageHeight - 100 ? pageHeight - 100 : imgHeight
                );
            } catch (err) {
                console.error(`Error exporting ${id}:`, err);
            }
        }

        pdf.save('charts_report.pdf');
    };

    //CHECK
    const exportToPDF = (label, key, id) => {
        const doc = new jsPDF();
        doc.text(`${label}`, 10, 10);
        autoTable(doc, {
            head: [["Epoch", `${label}`]],
            body: data.map((row) => [row.epoch, row[key]]),
        });
        doc.save(`${label.toLowerCase()}.pdf`);
    };

    const exportToCSV = (label, keys) => {
        const filteredData = data.map(row => {
            const filteredRow = { epoch: row.epoch };
            keys.forEach(key => {
                filteredRow[key] = row[key];
            });
            return filteredRow;
        });
        const csvContent = [
            ["Epoch", ...keys], // header
            ...filteredData.map(row => [row.epoch, ...keys.map(key => row[key])])
        ]
            .map(e => e.join(","))
            .join("\n");

        saveAs(
            new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
            `${label.toLowerCase()}.csv`
        );
    };

    const exportChartToPNG = (id, label) => {
        const node = document.getElementById(id);
        if (!node) return;

        toPng(node)
            .then((dataUrl) => {
                const link = document.createElement("a");
                link.download = `${label.toLowerCase()} chart.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error("Error exporting chart:", err);
            });
    };


    const renderSummaryCards = () => {
        if (data.length === 0) return null;

        const lastEpoch = data[data.length - 1];

        const importantMetrics = [
            'train_accuracy', 'val_accuracy',
            'train_f1', 'val_f1',
            'train_precision', 'val_precision',
            'train_recall', 'val_recall'
        ];
        const importantMetricsKeys = importantMetrics.filter(metricKey => lastEpoch[metricKey] !== null);
        const importantMetricsCount = importantMetricsKeys.length;
        return (
            <Paper withBorder p="md" mb="xl" radius="lg">
                <Text size="md" c="dimmed" fw={600}>
                    {importantMetricsCount > 0 ? `Performance Metrics` : "No performance metrics available"}
                </Text>
                <SimpleGrid cols={4}>
                    {importantMetrics.map(metricKey => {
                        const metric = METRICS.find(m => m.value === metricKey);
                        if (!metric || lastEpoch[metricKey] === null) return null;

                        return (
                            <Tooltip label={metric.label} key={metricKey}>
                                <Card shadow="sm" padding="lg" radius="md" withBorder>
                                    <Text size="sm" c="dimmed">{metric.label}</Text>
                                    <Text size="xl" fw={700} c={metric.color}>
                                        {typeof lastEpoch[metricKey] === 'number' ?
                                            lastEpoch[metricKey].toFixed(4) : 'N/A'}
                                    </Text>
                                </Card>
                            </Tooltip>
                        );
                    })}
                </SimpleGrid>
            </Paper>

        );
    };

    const renderMetricChart = (metrics, title) => {
        const series = metrics
            .map(metricKey => {
                const metric = METRICS.find(m => m.value === metricKey);
                return metric ? {
                    name: metric.value,
                    color: metric.color,
                    label: metric.label
                } : null;
            })
            .filter(Boolean);
        // Filtrar los datos para ver si hay al menos un valor válido en las métricas seleccionadas
        const hasData = data.some(row =>
            series.some(s => row[s.name] !== null && row[s.name] !== undefined)
        );
        const id = `${title.toLowerCase().replace(/\s+/g, '-')}-chart`;
        return (
            series.length === 0 ? (
                <Text size="md" c="dimmed" ta="center">No metrics selected</Text>
            ) : !hasData ? (
                <Text size="md" c="dimmed" ta="center">No data available for these metrics</Text>
            ) : (
                <Box id="combined-chart" style={{ minWidth: 300, minHeight: 350, width: '100%' }}>
                    <Group justify="space-between">
                        <Title order={4}>{title}</Title>
                        <Group spacing="xs">
                            {/* <Button variant="outline" size="xs" onClick={() => exportToPDF(title, metrics, id)} leftSection={<Icons.FilePdf />}>PDF</Button> */}
                            <Button variant="outline" size="xs" 
                            // onClick={() => exportToCSV(title, metrics)} 
                            leftSection={<Icons.FileCsv />}>CSV</Button>
                            <Button variant="outline" size="xs" 
                            // onClick={() => exportChartToPNG(id, title)} 
                            leftSection={<Icons.Image />}>PNG</Button>
                        </Group>
                    </Group>
                    <Divider mt="sm" mb="xl" />
                    <Box w="100%" h="100%" id={id}>
                        <LineChart
                            h={350}
                            data={data}
                            dataKey="epoch"
                            series={series}
                            curveType="linear"
                            withLegend
                            legendProps={{ verticalAlign: 'bottom' }}
                            tooltipAnimationDuration={200}
                            valueFormatter={(value) => value?.toFixed(4) || 'N/A'}
                        />
                    </Box>
                </Box>
            )
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
                data.length > 0 && (
                    <Box w="100%" mb="xl">
                        <Group justify="space-between" align="center" mb="xl" wrap="wrap">
                            <Title order={3}>Training Results</Title>
                            <Button variant="outline" leftSection={<Icons.FilePdf />}
                                // onClick={downloadReport}
                            > Download Report</Button>
                        </Group>
                        {renderSummaryCards()}

                        <Tabs mt="xl" value={activeTab} onChange={setActiveTab}>
                            <Tabs.List>
                                <Tabs.Tab value="custom">Custom Metrics</Tabs.Tab>
                                <Tabs.Tab value="loss">Loss</Tabs.Tab>
                                <Tabs.Tab value="accuracy">Accuracy</Tabs.Tab>
                                <Tabs.Tab value="f1">F1 Scores</Tabs.Tab>
                                <Tabs.Tab value="other">Other Metrics</Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="custom" pt="md">
                                <Text size="md" mb="sm">Select metrics to display:</Text>
                                <MultiSelect
                                    placeholder="Choose metrics"
                                    data={keysAvailable}
                                    value={selectedMetrics}
                                    onChange={setSelectedMetrics}
                                    clearable
                                    searchable
                                    maxSelectedValues={5}
                                    mb="xl"
                                />

                                {renderMetricChart(selectedMetrics, "Metrics comparison")}
                            </Tabs.Panel>

                            <Tabs.Panel value="loss" pt="md">
                                {renderMetricChart(['train_loss', 'val_loss'], "Loss")}
                            </Tabs.Panel>

                            <Tabs.Panel value="accuracy" pt="md">
                                {renderMetricChart(['train_accuracy', 'val_accuracy'], "Accuracy")}
                            </Tabs.Panel>

                            <Tabs.Panel value="f1" pt="md">
                                {renderMetricChart(['train_f1', 'val_f1'], "F1 Score")}
                            </Tabs.Panel>

                            <Tabs.Panel value="other" pt="md">
                                {renderMetricChart(['train_precision', 'val_precision', 'train_recall', 'val_recall'], "Precision and Recall")}
                            </Tabs.Panel>
                        </Tabs>
                    </Box>
                )
            )}
        </Flex >
    );
};


export default Results;
