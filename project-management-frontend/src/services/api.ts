import axios, { type AxiosInstance, isAxiosError } from 'axios';

// ----------------------------------------------------------------------
// Configuration – adjust these to match your environment
// ----------------------------------------------------------------------
const DEFAULT_LOCAL = 'http://localhost:3000/api';
const ENV_LOCAL = import.meta.env.VITE_API_LOCAL || DEFAULT_LOCAL;
const ENV_DEPLOYED = import.meta.env.VITE_API_DEPLOYED || import.meta.env.VITE_API_URL || '';

// Storage keys
const STORAGE_KEY_MODE = 'apiBaseUrl';           // 'auto' or a fixed URL
const STORAGE_KEY_LAST_DETECTED = 'lastDetectedApiUrl'; // last working URL when in 'auto' mode

// ----------------------------------------------------------------------
// Initial base URL: if mode is 'auto', use last detected URL (if any), otherwise use local default.
// ----------------------------------------------------------------------
const getInitialBaseUrl = (): string => {
  const mode = localStorage.getItem(STORAGE_KEY_MODE);
  if (mode && mode !== 'auto') return mode; // user manually set a fixed URL

  // 'auto' mode (or not set) – use last detected URL if available, otherwise local default
  const lastDetected = localStorage.getItem(STORAGE_KEY_LAST_DETECTED);
  return lastDetected || ENV_LOCAL;
};

// ----------------------------------------------------------------------
// Create axios instance with initial base URL
// ----------------------------------------------------------------------
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
 * - If the request succeeds (any HTTP status) → local is reachable → use local.
 * - If it fails with a network error (no response) → local is down → use deployed.
 * Updates the "last detected" URL in localStorage so the next load starts with the working URL.
 */
async function detectBestApiUrl(): Promise<void> {
  const mode = localStorage.getItem(STORAGE_KEY_MODE);
  // If user manually set a URL (not 'auto'), do nothing
  if (mode && mode !== 'auto') return;

  try {
    // Send HEAD request to the exact base URL (no extra path)
    await api.head('', { timeout: 1000 });
    // Any response (2xx, 4xx, 5xx) means the server is reachable
    console.log('📡 Local backend detected, using:', ENV_LOCAL);
    setApiBaseUrlInner(ENV_LOCAL, true); // true = update last detected
  } catch (error) {
    if (isAxiosError(error) && !error.response) {
      // Network error – server unreachable (down or CORS blocked)
      console.log('🌐 Local backend unavailable, falling back to:', ENV_DEPLOYED);
      if (ENV_DEPLOYED) {
        setApiBaseUrlInner(ENV_DEPLOYED, true);
      } else {
        console.warn('No deployed URL configured – staying with local backend (may fail)');
      }
    } else {
      // HTTP error (4xx/5xx) – server is up, so use local
      console.log('📡 Local backend responded (with error), using:', ENV_LOCAL);
      setApiBaseUrlInner(ENV_LOCAL, true);
    }
  }
}

/**
 * Internal setter – updates the axios instance and optionally stores the URL as last detected.
 */
function setApiBaseUrlInner(url: string, storeAsLastDetected = false): void {
  api.defaults.baseURL = url;
  if (storeAsLastDetected) {
    localStorage.setItem(STORAGE_KEY_LAST_DETECTED, url);
  }
}

// ----------------------------------------------------------------------
// Public functions to get/set the base URL (with 'auto' support)
// ----------------------------------------------------------------------
export function setApiBaseUrl(url: string): void {
  if (url === 'auto') {
    localStorage.setItem(STORAGE_KEY_MODE, 'auto');
    // Reset detection promise so it runs again with fresh state
    detectionPromise = null;
    detectionPromise = detectBestApiUrl();
  } else {
    localStorage.setItem(STORAGE_KEY_MODE, url);
    // When user sets a fixed URL, also store it as last detected (so it persists)
    setApiBaseUrlInner(url, true);
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
// These are the RECOMMENDED way to call the API.
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
// Raw axios instance – EXPORT WITH CAUTION
// Direct usage may bypass the detection wait and cause requests to the wrong URL.
// Prefer using the grouped APIs above.
// ----------------------------------------------------------------------
export { api };
export default api;