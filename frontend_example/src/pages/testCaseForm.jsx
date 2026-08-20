import {
    Button, Group, Stack, Title, Stepper, Tooltip, useMantineTheme
} from "@mantine/core";
import { useState, useEffect } from "react";
import TitleUnderlined from "../components/title-underlined";
import ModelConfig from "../components/model-config";
import TrainerConfig from "../components/trainer-config";
import TestCaseConfig from "../components/testCase-config";
import DatasetConfig from "../components/dataset-config"
import { useMediaQuery } from '@mantine/hooks';
import { Icons } from '../icons';


const TestCaseForm = ({ initialData = null, onSubmit, onCancel }) => {
    const [active, setActive] = useState(0);
    const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
    const [datasetID, setDatasetID] = useState(initialData?.datasetId || null);
    const [datasetClasses, setDatasetClasses] = useState(null);

    const [measurerConfig, setMeasurerConfig] = useState(
        initialData?.measurer ||
        {
            type: "codecarbon",
            measure_interval: 5,
        });


    const [testCaseConfig, setTestCaseConfig] = useState(
        initialData || { name: "new_test_case", metrics: ["total"], measurer: measurerConfig, description: "" }
    );

    const [modelConfig, setModelConfig] = useState(
        initialData?.modelConfig || {});

    const [trainerConfig, setTrainerConfig] = useState(
        initialData?.trainerConfig || {
            batch_size: 32,
            epochs: 3,
            n_epochs_not_improving: 5,
            tol: 0.0001,
            learning_rate: 0.01,
            optimizer: "SGD",
            early_stopping: false,
            evaluate_metrics: true,
            warm_start: false,
            validation_fraction: 0.1,
        });

    const [steps, setSteps] = useState([
        {
            label: 'Test Case',
            description: 'Test Case Config',
            error: false,
            errorMessage: '',
        },
        {
            label: 'Dataset',
            description: 'Dataset Config',
            error: false,
            errorMessage: '',
        },
        {
            label: 'Model',
            description: 'Model Config',
            error: false,
            errorMessage: '',

        },
        {
            label: 'Trainer',
            description: 'Trainer Config',
            error: false,
            errorMessage: '',
        },
    ]);

    useEffect(() => {
        if (initialData) {
            setTestCaseConfig({ name: initialData.name, metrics: initialData.metrics, measurer: initialData.measurer, description: initialData.description });
            setModelConfig(initialData.modelConfig);
            setTrainerConfig(initialData.trainerConfig);
        }
    }, [initialData]);


    const isStepValid = () => {
        return !steps[active]?.error;
    };


    const handleNext = async () => {
        if (active === 3) {
            onSubmit({ testCaseConfig, modelConfig, trainerConfig, measurerConfig, datasetID });
        } else {
            nextStep();
        }
    }

    const handlePrev = () => {
        if (active === 0) {
            onCancel();
        } else {
            prevStep();
        }
    };

    const updateStepError = (index, isValid, errorMessage = "") => {
        setSteps((prevSteps) => {
            const updated = [...prevSteps];
            updated[index] = { ...updated[index], error: !isValid, errorMessage };
            return updated;
        });
    };

    return (
        <Stack gap="lg" p={{ base: 'md', md: 'xl' }} pt={0} mx="auto" maw={1000}>
            <Title order={1} ta="center" size={isMobile ? "h2" : "h1"}>{initialData ? "EDIT TEST CASE" : "NEW TEST CASE"}</Title>

            <Stepper active={active} onStepClick={setActive} size={isMobile ? "sm" : "md"}>
                {steps.map((step, index) => (
                    <Stepper.Step
                        key={index}
                        label={step.label}
                        description={step.description}
                        allowStepSelect={index <= active}
                    />
                ))}
            </Stepper>

            {/* Contenido condicional según el paso activo */}
            {active === 0 && (
                <>
                    <TitleUnderlined title={""} />
                    <TestCaseConfig
                        config={testCaseConfig}
                        setConfig={setTestCaseConfig}
                        onValidationChange={(isValid, msg) => updateStepError(0, isValid, msg)}
                    />
                </>
            )}

            {active === 1 && (
                <>
                    <TitleUnderlined title={""} />
                    <DatasetConfig
                        initialDataset={datasetID}
                        setInitialDataset={setDatasetID}
                        setDatasetClasses={setDatasetClasses}
                        onValidationChange={(isValid, msg) => updateStepError(1, isValid, msg)}
                    />
                </>
            )}

            {active === 2 && (
                <>
                    <TitleUnderlined title={""} />
                    <ModelConfig
                        data={modelConfig}
                        onChange={setModelConfig}
                        datasetClasses={datasetClasses}
                        onValidationChange={(isValid, msg) => updateStepError(2, isValid, msg)}
                    />
                </>
            )}

            {active === 3 && (
                <>
                    <TitleUnderlined title={""} />
                    <TrainerConfig
                        data={trainerConfig}
                        onChange={setTrainerConfig}
                        onValidationChange={(isValid, msg) => updateStepError(3, isValid, msg)}
                    />
                </>
            )}

            <Group justify="space-around" mt="xl" bottom={isMobile ? 20 : 'auto'} >
                <Button variant="default" onClick={handlePrev}
                    leftSection={<Icons.AngleLeft />}>
                    {active === 0 ? "Cancel" : "Previous step"}
                </Button>


                <Button onClick={handleNext} rightSection={<Icons.AngleRight />} disabled={!isStepValid()} title={steps[active].errorMessage}>
                    {active === 3 ? "Finish" : "Next step"}
                </Button>
            </Group>

        </Stack>
    );
};

export default TestCaseForm;
