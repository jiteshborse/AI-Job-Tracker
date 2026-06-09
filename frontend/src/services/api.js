import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (credentials) =>
        api.post('/auth/login', credentials),

    register: (details) =>
        api.post('/auth/register', details),

    getProfile: () =>
        api.get('/auth/me'),
};

// Jobs API
export const jobApi = {
    getJobs: (filters = {}) =>
        api.get('/jobs', { params: filters }), // This calls /api/jobs

    getJobById: (id) =>
        api.get(`/jobs/${id}`),
};

// Resume API
export const resumeApi = {
    uploadResume: (formData) =>
        api.post('/resume/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),

    getResume: () =>
        api.get('/resume'),
};

// Applications API
export const applicationApi = {
    trackApplication: (data) =>
        api.post('/applications/track', data),

    updateStatus: (appId, status, userId) =>
        api.put(`/applications/${appId}/status`, { status, userId }),

    getApplications: (filters = {}) =>
        api.get('/applications', { params: filters }),

    clearApplications: (userId) =>
        api.delete('/applications/clear', { params: { userId } }),

    deleteApplication: (appId) =>
        api.delete(`/applications/${appId}`),
};

// AI API
export const aiApi = {
    chat: (query, context = {}) =>
        api.post('/ai/chat', { query, context }),
};

export default api;