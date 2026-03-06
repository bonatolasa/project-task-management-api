import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from 'src/projects/schemas/project.schema';
import { Task } from 'src/tasks/schemas/tasks.schema';
import { Team } from 'src/teams/schemas/team.schema';
import { User } from 'src/users/schemas/users.schemas';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Team.name) private teamModel: Model<Team>,
  ) {}

  // Helper to round numbers to two decimals
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  async getDashboardStats() {
    const [
      totalProjects,
      totalTasks,
      totalUsers,
      totalTeams,
      activeProjects,
      completedTasks,
      overdueTasks,
      overdueProjects,
    ] = await Promise.all([
      this.projectModel.countDocuments(),
      this.taskModel.countDocuments(),
      this.userModel.countDocuments(),
      this.teamModel.countDocuments(),
      this.projectModel.countDocuments({ status: 'in_progress' }),
      this.taskModel.countDocuments({ status: 'completed' }),
      this.taskModel.countDocuments({
        deadline: { $lt: new Date() },
        status: { $ne: 'completed' },
      }),
      this.projectModel.countDocuments({
        deadline: { $lt: new Date() },
        status: { $ne: 'completed' },
      }),
    ]);

    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalProjects,
      totalTasks,
      totalUsers,
      totalTeams,
      activeProjects,
      completedTasks,
      overdueTasks,
      overdueProjects,
      taskCompletionRate: this.round(taskCompletionRate),
    };
  }

  async getProjectPerformance(projectId: string) {
    const tasks = await this.taskModel.find({ project: projectId }).exec();

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t =>
      t.deadline < new Date() && t.status !== 'completed'
    ).length;

    const averageProgress = total > 0
      ? tasks.reduce((sum, t) => sum + t.percentageComplete, 0) / total
      : 0;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      averageProgress: this.round(averageProgress),
      completionRate: this.round(completionRate),
    };
  }

  async getUserPerformance(userId: string) {
    const tasks = await this.taskModel.find({ assignedTo: userId }).exec();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t =>
      t.deadline < new Date() && t.status !== 'completed'
    ).length;

    const averageCompletionTime = this.calculateAverageCompletionTime(tasks);
    const efficiencyScore = this.calculateEfficiencyScore(tasks);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      completionRate: this.round(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0),
      averageCompletionTime: this.round(averageCompletionTime),
      efficiencyScore: this.round(efficiencyScore),
    };
  }

  async getTeamPerformance(teamId: string) {
    const team = await this.teamModel.findById(teamId).populate('members').exec();

    if (!team) {
      throw new BadRequestException('Team not found');
    }
    const projects = await this.projectModel.find({ team: teamId }).exec();

    const projectIds: Types.ObjectId[] = projects.map(
      p => new Types.ObjectId(p._id)
    );
    const tasks = await this.taskModel.find({ project: { $in: projectIds } }).exec();

    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t =>
      t.deadline < new Date() && t.status !== 'completed'
    ).length;

    const memberStats = await Promise.all(
      team.members.map(async (member: any) => {
        const userTasks = tasks.filter(t =>
          t.assignedTo?.equals(member._id)
        );

        const completedUserTasks = userTasks.filter(t => t.status === 'completed').length;

        return {
          userId: member._id,
          userName: member.name,
          totalTasks: userTasks.length,
          completedTasks: completedUserTasks,
          completionRate: this.round(userTasks.length > 0 ? (completedUserTasks / userTasks.length) * 100 : 0),
        };
      })
    );

    return {
      teamName: team.name,
      totalProjects,
      completedProjects,
      projectCompletionRate: this.round(totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0),
      totalTasks,
      completedTasks,
      overdueTasks,
      taskCompletionRate: this.round(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0),
      memberStats,
    };
  }

  async getTaskStatusDistribution() {
    const tasks = await this.taskModel.find().exec();

    const distribution = {
      pending: 0,
      in_progress: 0,
      in_review: 0,
      completed: 0,
      blocked: 0,
    };

    tasks.forEach(task => {
      distribution[task.status]++;
    });

    return distribution;
  }

  async getProjectStatusDistribution() {
    const projects = await this.projectModel.find().exec();

    const distribution = {
      planning: 0,
      in_progress: 0,
      on_hold: 0,
      completed: 0,
      cancelled: 0,
    };

    projects.forEach(project => {
      distribution[project.status]++;
    });

    return distribution;
  }

  async getTeamWorkload(teamId: string) {
    const team = await this.teamModel.findById(teamId).populate('members').exec();
    const projects = await this.projectModel.find({ team: teamId }).exec();

    if (!team) {
      throw new BadRequestException(`Team with ID ${teamId} not found`);
    }

    const projectIds: Types.ObjectId[] = projects.map(p => new Types.ObjectId(p._id));
    const tasks = await this.taskModel.find({ project: { $in: projectIds } }).exec();

    const workloadByMember = {};

    team.members.forEach((member: any) => {
      const memberTasks = tasks.filter(t =>
        t.assignedTo && t.assignedTo?.equals(member._id)
      );

      workloadByMember[member._id.toString()] = {
        userId: member._id,
        userName: member.name,
        totalTasks: memberTasks.length,
        pendingTasks: memberTasks.filter(t => t.status === 'pending').length,
        inProgressTasks: memberTasks.filter(t => t.status === 'in_progress').length,
        completedTasks: memberTasks.filter(t => t.status === 'completed').length,
        overdueTasks: memberTasks.filter(t =>
          t.deadline < new Date() && t.status !== 'completed'
        ).length,
      };
    });

    return {
      teamName: team.name,
      totalProjects: projects.length,
      totalTasks: tasks.length,
      workloadByMember,
    };
  }

  async getTimeTrackingReport(startDate: Date, endDate: Date) {
    const tasks = await this.taskModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate('assignedTo', 'name email').exec();

    const report = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
      totalActualHours: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
      tasksByUser: {},
    };

    tasks.forEach(task => {
      if (task.assignedTo) {
        const userId = (task.assignedTo as any)._id.toString();
        const userName = (task.assignedTo as any).name;

        if (!report.tasksByUser[userId]) {
          report.tasksByUser[userId] = {
            userId,
            userName,
            totalTasks: 0,
            completedTasks: 0,
            estimatedHours: 0,
            actualHours: 0,
          };
        }

        report.tasksByUser[userId].totalTasks++;
        if (task.status === 'completed') {
          report.tasksByUser[userId].completedTasks++;
        }
        report.tasksByUser[userId].estimatedHours += task.estimatedHours || 0;
        report.tasksByUser[userId].actualHours += task.actualHours || 0;
      }
    });

    // Optionally round hours to two decimals for consistency
    report.totalEstimatedHours = this.round(report.totalEstimatedHours);
    report.totalActualHours = this.round(report.totalActualHours);
    Object.values(report.tasksByUser).forEach((user: any) => {
      user.estimatedHours = this.round(user.estimatedHours);
      user.actualHours = this.round(user.actualHours);
    });

    return report;
  }

  private calculateAverageCompletionTime(tasks: any[]): number {
    const completedTasks = tasks.filter(t => t.completedAt && t.startedAt);
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const completionTime = task.completedAt.getTime() - task.startedAt.getTime();
      return sum + completionTime;
    }, 0);

    // Convert to days
    return totalTime / completedTasks.length / (1000 * 60 * 60 * 24);
  }

  private calculateEfficiencyScore(tasks: any[]): number {
    if (tasks.length === 0) return 0;

    const onTimeTasks = tasks.filter(task => {
      if (task.status !== 'completed' || !task.completedAt) return false;
      return task.completedAt <= task.deadline;
    }).length;

    return (onTimeTasks / tasks.length) * 100;
  }
}