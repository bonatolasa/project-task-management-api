import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../schemas/project.schema';
import { TeamsService } from 'src/teams/services/teams.service';
import { UsersService } from 'src/users/services/users.service';
import { CreateProjectDto, UpdateProjectDto } from '../dtos/project.dto';
import { ProjectResponseDto } from '../responses/project.response';
import { ProjectStatus } from 'src/enums/project-status.enum';
import { NotificationsService } from 'src/notifications/services/notifications.service';


@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private teamsService: TeamsService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) { }

  //create project services
  async create(createProjectDto: CreateProjectDto): Promise<ProjectResponseDto> {
    // Validate that the team exists and get its members
    const team = await this.teamsService.findById(createProjectDto.team);
    if (!team) {
      throw new BadRequestException('Invalid team ID. Team does not exist.');
    }

    // Set contributors to team member IDs (schema expects ObjectId refs)
    const members = (team as any).members || [];
    // members from TeamsService may be objects ({ id, name, email }) or mongoose docs
    createProjectDto.contributors = members.map((m: any) => m.id || m._id || m);

    const createdProject = new this.projectModel(createProjectDto);
    const savedProject = await createdProject.save();

    // Populate the newly created project to get team/manager info for notifications
    const project = await this.projectModel
      .findById(savedProject._id)
      .populate('team', 'name members')
      .populate('manager', 'name')
      .exec();

    if (project) {
      // Notify Team Members
      const team: any = project.team;
      if (team && team.members && team.members.length > 0) {
        for (const memberId of team.members) {
          await this.notificationsService.create({
            userId: memberId.toString(),
            title: 'New Project in Team',
            message: `A new project "${project.name}" has been assigned to your team.`,
            type: 'project_assignment',
            relatedId: project._id.toString()
          });
        }
      }
    }

    return this.getProjectWithDetails(savedProject._id.toString());
  }

  //get all projects services
  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.projectModel
      .find()
      .populate('team', 'name')
      .populate('manager', 'name email')
      .populate('contributors', 'name email')
      .exec();

    return Promise.all(projects.map(project => this.mapToResponseDto(project)));
  }

  //get project by id services
  async findById(id: string, user?: { id: string; role: string }): Promise<ProjectResponseDto> {
    const project = await this.projectModel
      .findById(id)
      .populate('team', 'name members')
      .populate('manager', 'name email')
      .populate('contributors', 'name email')
      .exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check authorization for members
    if (user && user.role.toLowerCase() === 'member') {
      const isInTeam = (project.team as any)?.members?.some(
        (member: any) => member._id.toString() === user.id
      );
      if (!isInTeam) {
        throw new ForbiddenException('You do not have permission to view this project');
      }
    }

    return this.mapToResponseDto(project);
  }

  //update project services
  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectResponseDto> {
    // If status is changed to completed, set completedAt
    if (updateProjectDto.status === 'completed') {
      updateProjectDto.completedAt = new Date();
      updateProjectDto.progress = 100;
    }

    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true, runValidators: true })
      .populate('team', 'name')
      .populate('manager', 'name email')
      .populate('contributors', 'name email')
      .exec();

    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return this.mapToResponseDto(updatedProject);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Project deleted successfully',
    };
  }

  async getProjectsByTeam(teamId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectModel
      .find({ team: teamId })
      .populate('team', 'name')
      .populate('manager', 'name email')
      .populate('contributors', 'name email')
      .exec();

    return Promise.all(projects.map(project => this.mapToResponseDto(project)));
  }

  async getProjectsByManager(managerId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectModel
      .find({ manager: managerId })
      .populate('team', 'name')
      .populate('manager', 'name email')
      .populate('contributors', 'name email')
      .exec();

    return Promise.all(projects.map(project => this.mapToResponseDto(project)));
  }

  async getProjectsByContributor(userId: string): Promise<ProjectResponseDto[]> {
    // find all teams the user belongs to
    const teams = await this.teamsService.getTeamsByMember(userId);
    const teamIds = teams.map(t => t.id);

    if (teamIds.length === 0) {
      // user isn't part of any team – return empty array
      return [];
    }

    const projects = await this.projectModel
      .find({ team: { $in: teamIds } })
      .populate('team', 'name')
      .populate('manager', 'name email')
      .populate('contributors', 'name email')
      .exec();

    return Promise.all(projects.map(project => this.mapToResponseDto(project)));
  }

  async addContributor(projectId: string, userId: string): Promise<ProjectResponseDto> {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if user is already a contributor
    if (!project.contributors.includes(userId as any)) {
      project.contributors.push(userId as any);
      await project.save();
    }

    return this.getProjectWithDetails(projectId);
  }

  async removeContributor(projectId: string, userId: string): Promise<ProjectResponseDto> {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    project.contributors = project.contributors.filter(contributorId =>
      contributorId.toString() !== userId
    );
    await project.save();

    return this.getProjectWithDetails(projectId);
  }

  async updateProgress(projectId: string, progress: number): Promise<ProjectResponseDto> {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Validate progress value
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    project.progress = progress;

    // Update status based on progress
    if (progress >= 100) {
      project.status = ProjectStatus.COMPLETED;
      project.completedAt = new Date();
    } else if (progress > 0 && project.status === ProjectStatus.PLANNING) {
      project.status = ProjectStatus.IN_PROGRESS;
    } else if (progress === 0) {
      project.status = ProjectStatus.PLANNING;
    } else if (progress > 0 && project.status === ProjectStatus.ON_HOLD) {
      project.status = ProjectStatus.IN_PROGRESS;
    }

    await project.save();
    return this.getProjectWithDetails(projectId);
  }

  async getOverdueProjects(): Promise<ProjectResponseDto[]> {
    const now = new Date();
    const projects = await this.projectModel
      .find({
        deadline: { $lt: now },
        status: { $ne: 'completed' },
      })
      .populate('team', 'name')
      .populate('manager', 'name email')
      .populate('contributors', 'name email')
      .exec();

    return Promise.all(projects.map(project => this.mapToResponseDto(project)));
  }

  private async getProjectWithDetails(projectId: string): Promise<ProjectResponseDto> {
    const project = await this.projectModel
      .findById(projectId)
      .populate('team', 'name')
      .populate('manager', 'name email')
      .populate('contributors', 'name email')
      .exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.mapToResponseDto(project);
  }

  private async mapToResponseDto(project: Project): Promise<ProjectResponseDto> {
    return {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      team: {
        id: (project.team as any)?._id?.toString() || '',
        name: (project.team as any)?.name || 'Unknown Team',
      },
      manager: {
        id: (project.manager as any)?._id?.toString() || '',
        name: (project.manager as any)?.name || 'Unknown Manager',
        email: (project.manager as any)?.email || '',
      },
      startDate: project.startDate,
      deadline: project.deadline,
      status: project.status,
      progress: project.progress,
      completedAt: project.completedAt,
      contributors: (project.contributors || []).map((contributor: any) => ({
        id: contributor?._id?.toString() || '',
        name: contributor?.name || 'Unknown',
        email: contributor?.email || '',
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}