import axios, {type AxiosInstance } from 'axios';

// runtime base URL management; enables switching between local and deployed endpoints
const DEFAULT_LOCAL = 'http://localhost:3000/api';
const ENV_LOCAL = import.meta.env.VITE_API_LOCAL || DEFAULT_LOCAL;
const ENV_DEPLOYED = import.meta.env.VITE_API_DEPLOYED || import.meta.env.VITE_API_URL || '';

let baseUrl = localStorage.getItem('apiBaseUrl') || ENV_LOCAL || DEFAULT_LOCAL;
if (!baseUrl && ENV_DEPLOYED) baseUrl = ENV_DEPLOYED;

let api: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

function setApiBaseUrl(url: string) {
  baseUrl = url;
  localStorage.setItem('apiBaseUrl', url);
  api.defaults.baseURL = url;
}

function getApiBaseUrl() {
  return api.defaults.baseURL || baseUrl;
}

// Add a request interceptor to attach the token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// helpers reused by components
const adminApi = {
  getUsers: (params?: Record<string, any>) => api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (payload: Record<string, any>) => api.post('/users', payload),
  updateUser: (id: string, payload: Record<string, any>) => api.patch(`/users/${id}`, payload),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  activateUser: (id: string) => api.patch(`/users/${id}`, { isActive: true }),
  deactivateUser: (id: string) => api.patch(`/users/${id}`, { isActive: false }),
};

const teamsApi = {
  createTeam: async (team: { name: string; managerId?: string; memberIds?: string[] }) => {
    const manager = team.managerId;
    const members = team.memberIds || [];
    if (!manager) throw new Error('Team must have at least one manager');
    if (members.length < 1) throw new Error('Team must have at least one member');
    return api.post('/teams', team);
  },
  updateTeam: (id: string, payload: { name?: string; description?: string; manager?: string; members?: string[] }) =>
    api.patch(`/teams/${id}`, payload),
  inviteMember: (teamId: string, email: string) => api.post(`/teams/${teamId}/invite`, { email }),
  getTeams: (params?: Record<string, any>) => api.get('/teams', { params }),
  getTeam: (id: string) => api.get(`/teams/${id}`),
};

const tasksApi = {
  getTasks: (params?: Record<string, any>) => api.get('/tasks', { params }),
  updateTask: (id: string, payload: Record<string, any>) => api.patch(`/tasks/${id}`, payload),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
};

const profileApi = {
  confirmPasswordAndUpdateProfile: async (currentPassword: string, profileData: Record<string, any>) => {
    try {
      await api.post('/auth/verify-password', { password: currentPassword });
      return api.patch('/users/me', profileData);
    } catch (err: any) {
      return api.patch('/users/me', { ...profileData, currentPassword });
    }
  },
};

export { api, setApiBaseUrl, getApiBaseUrl, adminApi, teamsApi, profileApi };
export default api;
