import {
  ProjectContributorDto,
  ProjectManagerDto,
  ProjectTeamDto,
} from '../dtos/project.dto';

export class ProjectResponseDto {
  _id: string;
  name: string;
  description?: string;
  team: ProjectTeamDto;
  manager: ProjectManagerDto;
  startDate: Date;
  deadline: Date;
  status: string;
  progress: number;
  completedAt?: Date;
  contributors: ProjectContributorDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectListResponseDto {
  success: boolean;
  data: ProjectResponseDto[];
  message: string;
}

export class SingleProjectResponseDto {
  success: boolean;
  data: ProjectResponseDto;
  message: string;
}

export class ProjectStatsResponseDto {
  success: boolean;
  data: {
    progress: number;
    taskStats: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
  };
  message: string;
}
