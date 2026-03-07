import api from './api';

// ─── Admin Dashboard ───
export const getDashboardStats = async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
};

export const getOverdueProjects = async () => {
    const response = await api.get('/projects/overdue');
    return response.data;
};

export const getOverdueTasks = async () => {
    const response = await api.get('/tasks/overdue');
    return response.data;
};

// ─── Project Manager Dashboard ───
export const getManagerProjects = async (managerId: string) => {
    const response = await api.get(`/projects/manager/${managerId}`);
    return response.data;
};

export const getManagerDashboardStats = async () => {
    const response = await api.get('/reports/manager-dashboard');
    return response.data;
};

export const getTeamPerformance = async (teamId: string) => {
    const response = await api.get(`/reports/team-performance/${teamId}`);
    return response.data;
};

export const getProjectPerformance = async (projectId: string) => {
    const response = await api.get(`/reports/project-performance/${projectId}`);
    return response.data;
};

export const getDueSoonTasks = async (days: number = 7) => {
    const response = await api.get(`/tasks/due-soon?days=${days}`);
    return response.data;
};

// ─── Team Member Dashboard ───
export const getMyTasks = async () => {
    const response = await api.get('/tasks/my-tasks');
    return response.data;
};

export const getUserPerformance = async (userId: string) => {
    const response = await api.get(`/reports/user-performance/${userId}`);
    return response.data;
};
