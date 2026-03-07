import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, UseGuards,
  Req
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TeamsService } from '../services/teams.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { SingleTeamResponseDto, TeamListResponseDto } from '../responses/teams.response';
import { CreateTeamDto, UpdateTeamDto } from '../dtos/teams.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';


@Controller('teams')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) { }


  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Post('create')
  async createTeam(@Body() createTeamDto: CreateTeamDto): Promise<SingleTeamResponseDto> {
    const team = await this.teamsService.createTeam(createTeamDto);
    return {
      success: true,
      data: team,
      message: 'Team created successfully',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get()
  async findAll(): Promise<TeamListResponseDto> {
    const teams = await this.teamsService.findAll();
    return {
      success: true,
      data: teams,
      message: 'Teams retrieved successfully',
    };
  }



  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Patch(':id')
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

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return await this.teamsService.remove(id);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Post(':teamId/members/:userId')
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

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Delete(':teamId/members/:userId')
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

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get('manager/:managerId')
  async getTeamsByManager(@Param('managerId') managerId: string): Promise<TeamListResponseDto> {
    const teams = await this.teamsService.getTeamsByManager(managerId);
    return {
      success: true,
      data: teams,
      message: 'Teams retrieved by manager',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get('my-team')
  async getMyTeam(@CurrentUser() user: { id: string }): Promise<SingleTeamResponseDto> {
    const team = await this.teamsService.getTeamByMember(user.id);
    return {
      success: true,
      data: team,
      message: 'Team retrieved successfully',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SingleTeamResponseDto> {
    const team = await this.teamsService.findById(id);
    return {
      success: true,
      data: team,
      message: 'Team retrieved successfully',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get(':id/members')
  async getTeamMembers(@Param('id') id: string): Promise<{ success: boolean; data: { _id: string; name: string; email: string; role: string }[]; message: string }> {
    const members = await this.teamsService.getTeamMembers(id);
    return {
      success: true,
      data: members,
      message: 'Team members retrieved successfully',
    };
  }
}
