// ─── Admin Dashboard Types ───
export interface DashboardStats {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    overdueProjects: number;
    totalUsers: number;
    totalTeams: number;
    taskCompletionRate: number;
}

export interface OverdueProject {
    _id: string;
    name: string;
    deadline: string;
    status: string;
    manager?: { name: string; email: string };
}

export interface OverdueTask {
    _id: string;
    title: string;
    deadline: string;
    priority: string;
    status: string;
    project?: { name: string };
    assignedTo?: { name: string };
}

// ─── Project Manager Types ───
export interface Project {
    _id: string;
    name: string;
    description?: string;
    status: string;
    progress?: number;
    deadline: string;
    startDate?: string;
    team?: { _id: string; name: string };
    manager?: { _id: string; name: string };
}

export interface TeamPerformance {
    teamName: string;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;
    completionRate: number;
    taskStatusDistribution?: { status: string; count: number }[];
}

export interface ProjectPerformance {
    projectName: string;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
}

// ─── Team Member Types ───
export interface MyTask {
    _id: string;
    title: string;
    description?: string;
    project?: { _id: string; name: string };
    priority: string;
    status: string;
    deadline: string;
    progress?: number;
}

export interface UserPerformance {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;
    completionRate: number;
}
