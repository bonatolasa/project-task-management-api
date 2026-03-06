export class TeamMemberDto {
  id: string;
  name: string;
  email: string;
  role: string;
}

export class TeamResponseDto {
  id: string;
  name: string;
  description?: string;
  manager: TeamMemberDto;
  members: TeamMemberDto[];
  isActive: boolean;
}

export class TeamListResponseDto {
  success: boolean;
  data: TeamResponseDto[];
  message: string;
}

export class SingleTeamResponseDto {
  success: boolean;
  data: TeamResponseDto;
  message: string;
}