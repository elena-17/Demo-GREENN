import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/datasets`;
import { api } from '../services/interceptor';
import mocked_datasets from '../mock_data/dataset.json';

export const DatasetService = {
    getDatasets: async () => {
        return [];
    },
    getDefaultDatasets: async () => {
        return [mocked_datasets];
    },
}
