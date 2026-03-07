import {
  DashboardStatsDto,
  ProjectPerformanceDto,
  StatusDistributionDto,
  TeamPerformanceDto,
  UserPerformanceDto,
} from '../dto/report.dto';

export class DashboardStatsResponseDto {
  success: boolean;
  data: DashboardStatsDto;
  message: string;
}

export class ProjectPerformanceResponseDto {
  success: boolean;
  data: ProjectPerformanceDto;
  message: string;
}

export class UserPerformanceResponseDto {
  success: boolean;
  data: UserPerformanceDto;
  message: string;
}

export class TeamPerformanceResponseDto {
  success: boolean;
  data: TeamPerformanceDto;
  message: string;
}

export class StatusDistributionResponseDto {
  success: boolean;
  data: StatusDistributionDto;
  message: string;
}
