import axios, { type AxiosInstance, isAxiosError } from 'axios';

// ----------------------------------------------------------------------
// Configuration – adjust these to match your environment
// ----------------------------------------------------------------------
const DEFAULT_LOCAL = 'http://localhost:3000/api';
const ENV_LOCAL = import.meta.env.VITE_API_LOCAL || DEFAULT_LOCAL;
const ENV_DEPLOYED = import.meta.env.VITE_API_DEPLOYED || import.meta.env.VITE_API_URL || '';

// ----------------------------------------------------------------------
// Initialise axios instance (baseURL may be updated later)
// ----------------------------------------------------------------------
const getInitialBaseUrl = (): string => {
  const saved = localStorage.getItem('apiBaseUrl');
  if (saved && saved !== 'auto') return saved;
  return ENV_LOCAL; // temporary default until detection runs
};

const api: AxiosInstance = axios.create({
  baseURL: getInitialBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// ----------------------------------------------------------------------
// Detection promise – ensures API calls wait for the first detection
// ----------------------------------------------------------------------
let detectionPromise: Promise<void> | null = null;

/**
 * Ping the local backend with a short timeout.
 * - If the request succeeds (any HTTP status) → local is reachable.
 * - If it fails with a network error (no response) → local is down → fallback to deployed.
 * - If it fails with an HTTP error (response exists) → local is reachable.
 */
async function detectBestApiUrl(): Promise<void> {
  const saved = localStorage.getItem('apiBaseUrl');
  // If user manually set a URL (not 'auto'), do nothing
  if (saved && saved !== 'auto') return;

  try {
    // Send HEAD request to the exact base URL (no extra path)
    await api.head('', { timeout: 1000 });
    // Any response (2xx, 4xx, 5xx) means the server is reachable
    console.log('📡 Local backend detected, using:', ENV_LOCAL);
    setApiBaseUrlInner(ENV_LOCAL);
  } catch (error) {
    if (isAxiosError(error) && !error.response) {
      // Network error – server unreachable (down or CORS blocked)
      console.log('🌐 Local backend unavailable, falling back to:', ENV_DEPLOYED);
      if (ENV_DEPLOYED) {
        setApiBaseUrlInner(ENV_DEPLOYED);
      } else {
        console.warn('No deployed URL configured – staying with local backend (may fail)');
      }
    } else {
      // HTTP error (4xx/5xx) – server is up, so use local
      console.log('📡 Local backend responded (with error), using:', ENV_LOCAL);
      setApiBaseUrlInner(ENV_LOCAL);
    }
  }
}

/**
 * Internal setter – updates the axios instance only.
 * (No separate `baseUrl` variable – source of truth is api.defaults.baseURL)
 */
function setApiBaseUrlInner(url: string): void {
  api.defaults.baseURL = url;
}

// ----------------------------------------------------------------------
// Public functions to get/set the base URL (with 'auto' support)
// ----------------------------------------------------------------------
export function setApiBaseUrl(url: string): void {
  if (url === 'auto') {
    localStorage.setItem('apiBaseUrl', 'auto');
    // Reset detection promise so it runs again with fresh state
    detectionPromise = null;
    detectionPromise = detectBestApiUrl();
  } else {
    localStorage.setItem('apiBaseUrl', url);
    setApiBaseUrlInner(url);
  }
}

export function getApiBaseUrl(): string | undefined {
  return api.defaults.baseURL;
}

// ----------------------------------------------------------------------
// Start detection immediately and store the promise
// ----------------------------------------------------------------------
detectionPromise = detectBestApiUrl();

/**
 * Helper to wait for detection before executing an API call.
 * Use this inside every exported function that uses the `api` instance.
 */
function withDetection<T>(fn: () => Promise<T>): Promise<T> {
  return (detectionPromise || Promise.resolve()).then(() => fn());
}

// ----------------------------------------------------------------------
// Axios interceptors (unchanged – token handling, 401 redirect)
// ----------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

// ----------------------------------------------------------------------
// Grouped API methods – each waits for detection before making the request
// ----------------------------------------------------------------------
export const adminApi = {
  getUsers: (params?: Record<string, any>) =>
    withDetection(() => api.get('/users', { params })),
  getUser: (id: string) =>
    withDetection(() => api.get(`/users/${id}`)),
  createUser: (payload: Record<string, any>) =>
    withDetection(() => api.post('/users', payload)),
  updateUser: (id: string, payload: Record<string, any>) =>
    withDetection(() => api.patch(`/users/${id}`, payload)),
  deleteUser: (id: string) =>
    withDetection(() => api.delete(`/users/${id}`)),
  activateUser: (id: string) =>
    withDetection(() => api.patch(`/users/${id}`, { isActive: true })),
  deactivateUser: (id: string) =>
    withDetection(() => api.patch(`/users/${id}`, { isActive: false })),
};

export const teamsApi = {
  createTeam: async (team: { name: string; managerId?: string; memberIds?: string[] }) => {
    await detectionPromise; // alternative to withDetection
    const manager = team.managerId;
    const members = team.memberIds || [];
    if (!manager) throw new Error('Team must have at least one manager');
    if (members.length < 1) throw new Error('Team must have at least one member');
    return api.post('/teams', team);
  },
  updateTeam: (id: string, payload: { name?: string; description?: string; manager?: string; members?: string[] }) =>
    withDetection(() => api.patch(`/teams/${id}`, payload)),
  inviteMember: (teamId: string, email: string) =>
    withDetection(() => api.post(`/teams/${teamId}/invite`, { email })),
  getTeams: (params?: Record<string, any>) =>
    withDetection(() => api.get('/teams', { params })),
  getTeam: (id: string) =>
    withDetection(() => api.get(`/teams/${id}`)),
};

export const tasksApi = {
  getTasks: (params?: Record<string, any>) =>
    withDetection(() => api.get('/tasks', { params })),
  updateTask: (id: string, payload: Record<string, any>) =>
    withDetection(() => api.patch(`/tasks/${id}`, payload)),
  deleteTask: (id: string) =>
    withDetection(() => api.delete(`/tasks/${id}`)),
};

export const profileApi = {
  confirmPasswordAndUpdateProfile: async (currentPassword: string, profileData: Record<string, any>) => {
    await detectionPromise;
    await api.post('/auth/verify-password', { password: currentPassword });
    return api.patch('/users/me', profileData);
  },
};

// ----------------------------------------------------------------------
// Re‑export the axios instance itself if needed elsewhere
// ----------------------------------------------------------------------
export { api };
export default api;