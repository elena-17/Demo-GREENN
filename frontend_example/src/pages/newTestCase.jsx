import { useNavigate, useParams } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { useProjects } from "../contexts/projectsContext";
import { TestCaseService } from "../services/testCaseService";
import TestCaseForm from "./testCaseForm";

export default function NewTestCase() {
    const { projectID } = useParams();
    const { addTestCase } = useProjects();
    const navigate = useNavigate();

    const handleSave = async ({ testCaseConfig, modelConfig, trainerConfig, measurerConfig, datasetID }) => {
        try {
            const response = await TestCaseService.createTestCase(testCaseConfig, modelConfig, trainerConfig, measurerConfig, projectID, datasetID);
            notifications.show({
                title: 'Test Case created',
                message: 'Test Case created successfully',
            });
            addTestCase(Number(projectID), response);
            if (response?.id) {
                setTimeout(() => navigate(`/testCases/${response.id}`), 50);
            } else {
                console.error("Test Case ID missing from response:", response);
            }

        } catch (error) {
            console.error("Failed to save testCase:", error);
            notifications.show({
                title: 'Error',
                message: 'Failed to create testCase',
                color: 'red',
            });
        }
    }

    return (
        <TestCaseForm
            projectID={projectID}
            initialData={null}
            onSubmit={handleSave}
            onCancel={() => navigate("/homepage")}
        />
    );
}
