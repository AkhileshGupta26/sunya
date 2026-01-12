import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

async function getHeaders(multipart = false) {
    const token = await AsyncStorage.getItem('auth_token');
    const headers: Record<string, string> = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!multipart) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
}

async function handleResponse(response: Response) {
    if (response.status === 401) {
        // Trigger generic logout if needed, but for now just throw specific error
        throw new ApiError('Session expired', 401);
    }

    if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch (e) {
            // response was not json
            errorMessage = response.statusText;
        }
        throw new ApiError(errorMessage, response.status);
    }

    try {
        // Handle 204 No Content
        if (response.status === 204) return null;
        return await response.json();
    } catch (e) {
        return null;
    }
}

export const api = {
    get: async (endpoint: string) => {
        const headers = await getHeaders();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });
        return handleResponse(response);
    },

    post: async (endpoint: string, body: any) => {
        const headers = await getHeaders();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    put: async (endpoint: string, body: any) => {
        const headers = await getHeaders();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    delete: async (endpoint: string) => {
        const headers = await getHeaders();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        return handleResponse(response);
    },

    // For file uploads if needed
    upload: async (endpoint: string, formData: FormData) => {
        const headers = await getHeaders(true); // true = multipart (no content-type set manually)
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers, // Don't set Content-Type for FormData
            body: formData,
        });
        return handleResponse(response);
    }
};
