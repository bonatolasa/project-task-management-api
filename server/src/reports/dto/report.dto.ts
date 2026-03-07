export class DashboardStatsDto {
  totalProjects: number;
  totalTasks: number;
  totalUsers: number;
  totalTeams: number;
  activeProjects: number;
  completedTasks: number;
  overdueTasks: number;
  overdueProjects: number;
  taskCompletionRate: number;
}

export class ProjectPerformanceDto {
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  averageProgress: number;
  completionRate: number;
}

export class UserPerformanceDto {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  efficiencyScore: number;
}

export class TeamMemberStatsDto {
  userId: string;
  userName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export class TeamPerformanceDto {
  teamName: string;
  totalProjects: number;
  completedProjects: number;
  projectCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  taskCompletionRate: number;
  memberStats: TeamMemberStatsDto[];
}

export class StatusDistributionDto {
  [key: string]: number;
}
