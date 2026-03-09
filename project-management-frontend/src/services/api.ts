import axios, { type AxiosInstance, isAxiosError } from 'axios';

// ----------------------------------------------------------------------
// Configuration – adjust these to match your environment
// ----------------------------------------------------------------------
const DEFAULT_LOCAL = 'http://localhost:3000/api';
const ENV_LOCAL = import.meta.env.VITE_API_LOCAL || DEFAULT_LOCAL;
const ENV_DEPLOYED = import.meta.env.VITE_API_DEPLOYED || import.meta.env.VITE_API_URL || '';

const STORAGE_KEY = 'apiBaseUrl'; // stores the actual URL (or 'auto' as a special flag)

// ----------------------------------------------------------------------
// Determine initial base URL
// ----------------------------------------------------------------------
const getInitialBaseUrl = (): string => {
  const stored = localStorage.getItem(STORAGE_KEY);
  // If it's a real URL (not 'auto'), use it
  if (stored && stored !== 'auto') return stored;
  // Otherwise (first run or 'auto' flag) start with local default (detection will run)
  return ENV_LOCAL;
};

// ----------------------------------------------------------------------
// Create axios instance with initial base URL
// ----------------------------------------------------------------------
const api: AxiosInstance = axios.create({
  baseURL: getInitialBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// ----------------------------------------------------------------------
// Auto‑detection (runs only when STORAGE_KEY is 'auto' or missing)
// After a successful detection, it overwrites STORAGE_KEY with the detected URL,
// so future loads use that URL directly without re‑detecting.
// ----------------------------------------------------------------------
let detectionPromise: Promise<void> | null = null;

async function detectAndSetBaseUrl(): Promise<void> {
  const stored = localStorage.getItem(STORAGE_KEY);
  // If a real URL is already stored (i.e., not 'auto'), do nothing.
  if (stored && stored !== 'auto') return;

  try {
    // Ping local backend with a short timeout
    await api.head('', { timeout: 1000 });
    // Any response (even 4xx/5xx) means the server is reachable
    console.log('📡 Local backend detected, using:', ENV_LOCAL);
    setBaseUrlAndStore(ENV_LOCAL);
  } catch (error) {
    if (isAxiosError(error) && !error.response) {
      // Network error – local is down → fallback to deployed
      console.log('🌐 Local backend unavailable, falling back to:', ENV_DEPLOYED);
      if (ENV_DEPLOYED) {
        setBaseUrlAndStore(ENV_DEPLOYED);
      } else {
        console.warn('No deployed URL configured – staying with local backend (may fail)');
      }
    } else {
      // HTTP error (4xx/5xx) – local is up, so use it
      console.log('📡 Local backend responded (with error), using:', ENV_LOCAL);
      setBaseUrlAndStore(ENV_LOCAL);
    }
  }
}

function setBaseUrlAndStore(url: string): void {
  api.defaults.baseURL = url;
  localStorage.setItem(STORAGE_KEY, url); // store as fixed URL (no more 'auto')
}

// ----------------------------------------------------------------------
// Public functions
// ----------------------------------------------------------------------
export function setApiBaseUrl(url: string): void {
  if (url === 'auto') {
    // User wants to re‑run detection
    localStorage.setItem(STORAGE_KEY, 'auto');
    detectionPromise = null; // reset so detection runs again
    detectionPromise = detectAndSetBaseUrl();
  } else {
    // User manually set a URL
    setBaseUrlAndStore(url);
  }
}

export function getApiBaseUrl(): string | undefined {
  return api.defaults.baseURL;
}

// ----------------------------------------------------------------------
// Start detection only if needed (first run or 'auto' flag present)
// ----------------------------------------------------------------------
if (localStorage.getItem(STORAGE_KEY) === 'auto' || !localStorage.getItem(STORAGE_KEY)) {
  detectionPromise = detectAndSetBaseUrl();
} else {
  // Already have a stored URL – no detection needed
  detectionPromise = Promise.resolve();
}

/**
 * Helper to wait for detection (if it's still running) before making a request.
 * All exported API methods use this to ensure they don't fire before the URL is finalised.
 */
function withDetection<T>(fn: () => Promise<T>): Promise<T> {
  return (detectionPromise || Promise.resolve()).then(() => fn());
}

// ----------------------------------------------------------------------
// Axios interceptors (unchanged)
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
// Grouped API methods – each waits for detection (if any) before making the request
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
    await detectionPromise;
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