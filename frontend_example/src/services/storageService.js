export class StorageService {
    constructor() {
        this.storage = sessionStorage;
    }

    setItem(key, value) {
        try {
            this.storage.setItem(key, value);
        } catch (error) {
            console.error('Error saving to storage', error);
        }
    }

    getItem(key) {
        try {
            return this.storage.getItem(key);
        } catch (error) {
            console.error('Error reading from storage', error);
            return null;
        }
    }

    removeItem(key) {
        try {
            this.storage.removeItem(key);
        } catch (error) {
            console.error('Error removing from storage', error);
        }
    }

    clear() {
        try {
            this.storage.clear();
        } catch (error) {
            console.error('Error clearing storage', error);
        }
    }
};
