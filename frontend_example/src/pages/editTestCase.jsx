import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { useProjects } from "../contexts/projectsContext";
import { TestCaseService } from "../services/testCaseService";
import TestCaseForm from "./testCaseForm";

export default function EditTestCase() {
    const { testCaseID } = useParams();
    const navigate = useNavigate();
    const { update_TestCase } = useProjects();
    const [initialData, setInitialData] = useState(null);
    const [projectID, setProjectID] = useState(null);

    useEffect(() => {
        fetchTestCase();
    }, [testCaseID]);


    const fetchTestCase = async () => {
        try {
            const response = await TestCaseService.getTestCaseById(testCaseID);
            setInitialData({
                name: response.name,
                metrics: response.metrics,
                measurer: response.parameters.measurer,
                modelConfig: response.parameters.model,
                trainerConfig: response.parameters.trainer,
                datasetId: response.datasetId,
            });
            setProjectID(response.projectId);
        } catch (error) {
            console.error("Error fetching Test Case:", error);
            notifications.show({
                title: `Error`,
                message: `Error fetching Test Case: ${error.message}`,
                color: "red"
            });
        }
    }


    const handleUpdate = async ({ testCaseConfig, modelConfig, trainerConfig, measurerConfig, datasetID }) => {
        const updated = await TestCaseService.updateTestCase(testCaseID, testCaseConfig, modelConfig, trainerConfig, measurerConfig, datasetID, projectID);
        notifications.show({ title: "Saved", message: "Test case updated" });
        update_TestCase(Number(projectID), updated);
        navigate(`/testCases/${testCaseID}`);
    };

    // Hasta que carguen los datos…
    if (!initialData) return null;

    return (
        <TestCaseForm
            projectID={projectID}
            initialData={initialData}
            onSubmit={handleUpdate}
            onCancel={() => navigate(-1)}
        />
    );
}
