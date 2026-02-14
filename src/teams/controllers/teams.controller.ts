import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards 
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TeamsService } from '../services/teams.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { SingleTeamResponseDto, TeamListResponseDto } from '../responses/teams.response';
import { CreateTeamDto, UpdateTeamDto } from '../dtos/teams.dto';


@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  async createTeam(@Body() createTeamDto: CreateTeamDto): Promise<SingleTeamResponseDto> {
    const team = await this.teamsService.createTeam(createTeamDto);
    return {
      success: true,
      data: team,
      message: 'Team created successfully',
    };
  }

  @Get()
  async findAll(): Promise<TeamListResponseDto> {
    const teams = await this.teamsService.findAll();
    return {
      success: true,
      data: teams,
      message: 'Teams retrieved successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SingleTeamResponseDto> {
    const team = await this.teamsService.findById(id);
    return {
      success: true,
      data: team,
      message: 'Team retrieved successfully',
    };
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  async update(
    @Param('id') id: string, 
    @Body() updateTeamDto: UpdateTeamDto
  ): Promise<SingleTeamResponseDto> {
    const team = await this.teamsService.update(id, updateTeamDto);
    return {
      success: true,
      data: team,
      message: 'Team updated successfully',
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return await this.teamsService.remove(id);
  }

  @Post(':teamId/members/:userId')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  async addMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ): Promise<SingleTeamResponseDto> {
    const team = await this.teamsService.addMember(teamId, userId);
    return {
      success: true,
      data: team,
      message: 'Member added to team successfully',
    };
  }

  @Delete(':teamId/members/:userId')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  async removeMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ): Promise<SingleTeamResponseDto> {
    const team = await this.teamsService.removeMember(teamId, userId);
    return {
      success: true,
      data: team,
      message: 'Member removed from team successfully',
    };
  }

  @Get('manager/:managerId')
  async getTeamsByManager(@Param('managerId') managerId: string): Promise<TeamListResponseDto> {
    const teams = await this.teamsService.getTeamsByManager(managerId);
    return {
      success: true,
      data: teams,
      message: 'Teams retrieved by manager',
    };
  }

  @Get('member/:memberId')
  async getTeamsByMember(@Param('memberId') memberId: string): Promise<TeamListResponseDto> {
    const teams = await this.teamsService.getTeamsByMember(memberId);
    return {
      success: true,
      data: teams,
      message: 'Teams retrieved by member',
    };
  }
}