import axios, { type AxiosInstance } from 'axios';

// runtime base URL management
const DEFAULT_LOCAL = 'http://localhost:3000/api';
const ENV_LOCAL = import.meta.env.VITE_API_LOCAL || DEFAULT_LOCAL;
const ENV_DEPLOYED = import.meta.env.VITE_API_DEPLOYED || import.meta.env.VITE_API_URL || '';

const getInitialBaseUrl = () => {
  const saved = localStorage.getItem('apiBaseUrl');
  if (saved && saved !== 'auto') return saved;
  // If 'auto' or not set, return local as temporary default
  return ENV_LOCAL;
};

let baseUrl: string = getInitialBaseUrl();

let api: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-detection logic
async function detectBestApiUrl() {
  const saved = localStorage.getItem('apiBaseUrl');
  if (saved && saved !== 'auto') return; // User manually set a URL

  try {
    // Ping local backend with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    await fetch(ENV_LOCAL, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('📡 Local backend detected, using:', ENV_LOCAL);
    setApiBaseUrlInner(ENV_LOCAL);
  } catch (err) {
    console.log('🌐 Local backend unavailable, falling back to:', ENV_DEPLOYED);
    if (ENV_DEPLOYED) {
      setApiBaseUrlInner(ENV_DEPLOYED);
    }
  }
}

// Internal setter that doesn't overwrite 'auto' in localStorage
function setApiBaseUrlInner(url: string) {
  baseUrl = url;
  api.defaults.baseURL = url;
}

function setApiBaseUrl(url: string) {
  if (url === 'auto') {
    localStorage.setItem('apiBaseUrl', 'auto');
    detectBestApiUrl();
  } else {
    localStorage.setItem('apiBaseUrl', url);
    setApiBaseUrlInner(url);
  }
}

function getApiBaseUrl() {
  return api.defaults.baseURL || baseUrl;
}

// Initial detection
detectBestApiUrl();

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
    await api.post('/auth/verify-password', { password: currentPassword });
    return api.patch('/users/me', profileData);
  },
};

export { api, setApiBaseUrl, getApiBaseUrl, adminApi, teamsApi, tasksApi, profileApi };
export default api;