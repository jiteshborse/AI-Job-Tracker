import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

    updateStatus: (appId, status) =>
        api.put(`/applications/${appId}/status`, { status }),

    getApplications: (filters = {}) =>
        api.get('/applications', { params: filters }),

    clearApplications: (userId) =>
        api.delete('/applications/clear', { params: { userId } }),
};

// AI API
export const aiApi = {
    chat: (query, context = {}) =>
        api.post('/ai/chat', { query, context }),
};

export default api;