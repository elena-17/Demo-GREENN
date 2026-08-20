import { useState, useEffect} from 'react';
import { motion } from 'framer-motion';

const nodePositions = [
    [75, 75, 75],
    [30, 60, 90, 120],
    [45, 75, 105],
    [75, 75, 75],
];


const CnnProgress = ({ totalEpochs = 10, currentEpoch }) => {
    const [epoch, setEpoch] = useState(0);
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState('forward');
    const totalNodes = nodePositions.reduce((acc, layer) => acc + layer.length, 0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => {
                if (direction === 'forward' && prev < totalNodes - 1) {
                    return prev + 1;
                } else if (direction === 'forward') {
                    setDirection('backward');
                    return prev;
                } else if (direction === 'backward' && prev > 0) {
                    return prev - 1;
                } else {
                    setDirection('forward');
                    setEpoch((prevEpoch) => (prevEpoch < totalEpochs ? prevEpoch + 1 : prevEpoch));
                    return 0;
                }
            });
        }, 300);
        return () => clearInterval(interval);
    }, [direction, totalNodes]);


    const getNodeId = (layerIdx, nodeIdx) => {
        return nodePositions.slice(0, layerIdx).reduce((acc, layer) => acc + layer.length, 0) + nodeIdx;
    };



    const renderConnections = () => {
        const paths = [];
        for (let l = 0; l < nodePositions.length - 1; l++) {
            for (let i = 0; i < nodePositions[l].length; i++) {
                for (let j = 0; j < nodePositions[l + 1].length; j++) {
                    const x1 = l * 80 + 30;
                    const y1 = nodePositions[l][i];
                    const x2 = (l + 1) * 80 + 30;
                    const y2 = nodePositions[l + 1][j];
                    paths.push({ x1, y1, x2, y2 });
                }
            }
        }
        return paths.map((line, idx) => (
            <line
                key={idx}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="gray"
                strokeWidth="1.5"
                opacity="0.5"
            />
        ));
    };



    const renderNodes = () => {

        return nodePositions.map((layer, lIdx) =>
            layer.map((y, nIdx) => {
                const nodeId = getNodeId(lIdx, nIdx);
                const isActive = direction === 'forward' ? nodeId <= step : nodeId >= step;
                const x = lIdx * 80 + 30;
                return (
                    <motion.circle
                        key={`node-${lIdx}-${nIdx}`}
                        cx={x}
                        cy={y}
                        r={7}
                        fill={isActive ? '#3B82F6' : 'white'}
                        stroke={isActive ? '#2563EB' : 'gray'}
                        strokeWidth="1.5"
                        animate={{ scale: isActive ? 1.4 : 1 }}
                        transition={{ duration: 0.3 }}
                    />
                );
            })
        );
    };


    return (
        <div className="bg-gray-900 text-white p-2 rounded shadow w-fit">
            <svg width="300" height="160">
                {renderConnections()}
                {renderNodes()}
            </svg>
            {/* <div className="text-sm text-center mt-1">Epoch: {currentEpoch}/{totalEpochs}</div> */}
        </div>
    );
};

export default CnnProgress;
