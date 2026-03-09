import axios, { type AxiosInstance } from 'axios';

// Configuration
const DEFAULT_LOCAL = 'http://localhost:3000/api';
const ENV_LOCAL = import.meta.env.VITE_API_LOCAL || DEFAULT_LOCAL;
const ENV_DEPLOYED = import.meta.env.VITE_API_DEPLOYED || import.meta.env.VITE_API_URL || '';

// State
let api: AxiosInstance | null = null;
let apiPromise: Promise<AxiosInstance> | null = null;

// Internal function to create a configured axios instance
function createApi(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  // Attach interceptors
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
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

  return instance;
}

// Core detection logic
async function detectBestApiUrl(): Promise<string> {
  const saved = localStorage.getItem('apiBaseUrl');
  if (saved && saved !== 'auto') return saved;

  // If we're in production build and no manual override, use deployed URL immediately
  if (!import.meta.env.DEV) {
    return ENV_DEPLOYED || ENV_LOCAL;
  }

  // In development, try local first with a proper ping
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    // Use a simple GET to a known endpoint that should exist (e.g., health)
    const response = await fetch(`${ENV_LOCAL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('📡 Local backend detected, using:', ENV_LOCAL);
      return ENV_LOCAL;
    } else {
      throw new Error('Local backend returned non-OK status');
    }
  } catch (err) {
    console.log('🌐 Local backend unavailable, falling back to:', ENV_DEPLOYED);
    return ENV_DEPLOYED || ENV_LOCAL; // fallback to local if deployed not set
  }
}

// Initialize API – returns a promise that resolves to the configured instance
async function initApi(): Promise<AxiosInstance> {
  const url = await detectBestApiUrl();
  api = createApi(url);
  return api;
}

// Export a function that returns the API instance (awaits initialization if needed)
export async function getApi(): Promise<AxiosInstance> {
  if (api) return api;
  if (!apiPromise) {
    apiPromise = initApi();
  }
  return apiPromise;
}

// Optional: manual override (like your original setApiBaseUrl)
export async function setApiBaseUrl(url: string) {
  if (url === 'auto') {
    localStorage.setItem('apiBaseUrl', 'auto');
    const newUrl = await detectBestApiUrl();
    api = createApi(newUrl);
  } else {
    localStorage.setItem('apiBaseUrl', url);
    api = createApi(url);
  }
  // Also update the promise for any concurrent waiters
  apiPromise = Promise.resolve(api);
}

export async function getApiBaseUrl(): Promise<string> {
  const instance = await getApi();
  return instance.defaults.baseURL!;
}

// Helper API groups (now async because they need to await the api instance)
export const adminApi = {
  getUsers: async (params?: Record<string, any>) => (await getApi()).get('/users', { params }),
  getUser: async (id: string) => (await getApi()).get(`/users/${id}`),
  createUser: async (payload: Record<string, any>) => (await getApi()).post('/users', payload),
  updateUser: async (id: string, payload: Record<string, any>) => (await getApi()).patch(`/users/${id}`, payload),
  deleteUser: async (id: string) => (await getApi()).delete(`/users/${id}`),
  activateUser: async (id: string) => (await getApi()).patch(`/users/${id}`, { isActive: true }),
  deactivateUser: async (id: string) => (await getApi()).patch(`/users/${id}`, { isActive: false }),
};

export const teamsApi = {
  createTeam: async (team: { name: string; managerId?: string; memberIds?: string[] }) => {
    const manager = team.managerId;
    const members = team.memberIds || [];
    if (!manager) throw new Error('Team must have at least one manager');
    if (members.length < 1) throw new Error('Team must have at least one member');
    return (await getApi()).post('/teams', team);
  },
  updateTeam: async (id: string, payload: { name?: string; description?: string; manager?: string; members?: string[] }) =>
    (await getApi()).patch(`/teams/${id}`, payload),
  inviteMember: async (teamId: string, email: string) => (await getApi()).post(`/teams/${teamId}/invite`, { email }),
  getTeams: async (params?: Record<string, any>) => (await getApi()).get('/teams', { params }),
  getTeam: async (id: string) => (await getApi()).get(`/teams/${id}`),
};

export const tasksApi = {
  getTasks: async (params?: Record<string, any>) => (await getApi()).get('/tasks', { params }),
  updateTask: async (id: string, payload: Record<string, any>) => (await getApi()).patch(`/tasks/${id}`, payload),
  deleteTask: async (id: string) => (await getApi()).delete(`/tasks/${id}`),
};

export const profileApi = {
  confirmPasswordAndUpdateProfile: async (currentPassword: string, profileData: Record<string, any>) => {
    await (await getApi()).post('/auth/verify-password', { password: currentPassword });
    return (await getApi()).patch('/users/me', profileData);
  },
};

// For backward compatibility, you can also export the promise directly
export default api;