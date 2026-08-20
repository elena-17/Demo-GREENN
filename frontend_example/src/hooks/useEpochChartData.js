import { useEffect, useState } from 'react';

export function useEpochChartData(perEpochReport, metricsProp) {
    const [chartData, setChartData] = useState([]);
    const [metricKeys, setMetricKeys] = useState([]);
    const [layers, setLayers] = useState([]);

    useEffect(() => {
        if (!perEpochReport || typeof perEpochReport !== 'object') return;

        if (metricsProp.includes('epoch')) {
            const keys = Object.keys(perEpochReport);
            setMetricKeys(keys);

            const epochs = Object.keys(perEpochReport[keys[0]] || {}).map(Number);
            const data = epochs.map((epoch) => {
                const entry = { epoch };
                keys.forEach((key) => {
                    entry[key] = perEpochReport[key]?.[epoch] ?? null;
                });
                return entry;
            });

            setChartData(data);
            setLayers([]);
        }

        else if (metricsProp.includes('layer')) {
            const keys = Object.keys(perEpochReport).filter(k => k !== 'layer' && k !== 'epoch');
            setMetricKeys(keys);

            if (!perEpochReport.epoch) return;

            const rawData = [];
            const totalEntries = Object.keys(perEpochReport.epoch).length;

            for (let i = 0; i < totalEntries; i++) {
                const entry = {
                    epoch: perEpochReport.epoch[i],
                    layer: perEpochReport.layer[i]
                };
                keys.forEach((key) => {
                    entry[key] = perEpochReport[key]?.[i];
                });
                rawData.push(entry);
            }

            const grouped = {};
            rawData.forEach((entry) => {
                const { epoch, layer } = entry;
                if (!grouped[epoch]) grouped[epoch] = { epoch };
                keys.forEach((key) => {
                    grouped[epoch][`${key}_${layer}`] = entry[key];
                });
            });
            setChartData(Object.values(grouped).sort((a, b) => a.epoch - b.epoch));
            const layersSet = new Set(Object.values(perEpochReport.layer));
            const layers = Array.from(layersSet);
            setLayers(layers);
        }
    }, [perEpochReport, metricsProp]);

    return { chartData, metricKeys, layers };
}
