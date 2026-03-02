import axios from 'axios';

export const API_URL_CONSTANT = 'https://prt-tsk-mgt-api.onrender.com/api/';

const api = axios.create({
    baseURL: API_URL_CONSTANT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
