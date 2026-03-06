import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team } from '../schemas/team.schema';
import { UsersService } from 'src/users/services/users.service';
import { CreateTeamDto, UpdateTeamDto } from '../dtos/teams.dto';
import { TeamResponseDto } from '../responses/teams.response';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<Team>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) { }


  // create a new team
  async createTeam(createTeamDto: CreateTeamDto): Promise<TeamResponseDto> {
    const createdTeam = new this.teamModel(createTeamDto);
    const savedTeam = await createdTeam.save();

    // Notify all managers about the new team
    const managers = await this.usersService.getUsersByRole(Role.MANAGER);
    await Promise.all(managers.map(manager =>
      this.notificationsService.create({
        userId: manager.id,
        title: 'New Team Created',
        message: `A new team "${savedTeam.name}" has been created.`,
        type: 'team_assignment'
      })
    ));

    return this.getTeamWithDetails(savedTeam._id.toString());
  }

  async findAll(): Promise<TeamResponseDto[]> {
    const teams = await this.teamModel
      .find()
      .populate('manager', 'name email role')
      .populate('members', 'name email role')
      .exec();

    return Promise.all(teams.map(team => this.mapToResponseDto(team)));
  }

  async findById(id: string): Promise<TeamResponseDto> {
    const team = await this.teamModel
      .findById(id)
      .populate('manager', 'name email role')
      .populate('members', 'name email role')
      .exec();

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return this.mapToResponseDto(team);
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<TeamResponseDto> {
    const updatedTeam = await this.teamModel
      .findByIdAndUpdate(id, updateTeamDto, { new: true, runValidators: true })
      .populate('manager', 'name email role')
      .populate('members', 'name email role')
      .exec();

    if (!updatedTeam) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return this.mapToResponseDto(updatedTeam);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.teamModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Team deleted successfully',
    };
  }

  async addMember(teamId: string, userId: string): Promise<TeamResponseDto> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check if user is already a member
    if (!team.members.includes(userId as any)) {
      team.members.push(userId as any);
      await team.save();

      // Notify member about team assignment
      await this.notificationsService.create({
        userId: userId,
        title: 'Assigned to Team',
        message: `You have been assigned to team "${team.name}".`,
        type: 'team_assignment'
      });
    }

    return this.getTeamWithDetails(teamId);
  }

  async removeMember(teamId: string, userId: string): Promise<TeamResponseDto> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    team.members = team.members.filter(memberId =>
      memberId.toString() !== userId
    );
    await team.save();

    return this.getTeamWithDetails(teamId);
  }

  async getTeamsByManager(managerId: string): Promise<TeamResponseDto[]> {
    const teams = await this.teamModel
      .find({ manager: managerId })
      .populate('manager', 'name email role')
      .populate('members', 'name email role')
      .exec();

    return Promise.all(teams.map(team => this.mapToResponseDto(team)));
  }

  async getTeamsByMember(memberId: string): Promise<TeamResponseDto[]> {
    const teams = await this.teamModel
      .find({ members: memberId })
      .populate('manager', 'name email role')
      .populate('members', 'name email role')
      .exec();

    return Promise.all(teams.map(team => this.mapToResponseDto(team)));
  }

  async getTeamMembers(teamId: string): Promise<{ _id: string; name: string; email: string; role: string }[]> {
    const team = await this.teamModel
      .findById(teamId)
      .populate('members', 'name email role')
      .exec();

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    return team.members.map((member: any) => ({
      _id: member._id.toString(),
      name: member.name,
      email: member.email,
      role: member.role,
    }));
  }

  private async getTeamWithDetails(teamId: string): Promise<TeamResponseDto> {
    const team = await this.teamModel
      .findById(teamId)
      .populate('manager', 'name email role')
      .populate('members', 'name email role')
      .exec();

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    return this.mapToResponseDto(team);
  }

  private async mapToResponseDto(team: Team): Promise<TeamResponseDto> {
    return {
      id: team._id.toString(),
      name: team.name,
      description: team.description,
      manager: team.manager ? {
        id: (team.manager as any)._id?.toString(),
        name: (team.manager as any).name,
        email: (team.manager as any).email,
        role: (team.manager as any).role,
      } : undefined,
      members: team.members.map((member: any) => ({
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        role: member.role,
      })),
      isActive: team.isActive
    };
  }
}