import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../schemas/project.schema';
import { TeamsService } from 'src/teams/services/teams.service';
import { UsersService } from 'src/users/services/users.service';
import { CreateProjectDto, UpdateProjectDto } from '../dtos/project.dto';
import { ProjectResponseDto } from '../responses/project.response';
import { ProjectStatus } from 'src/enums/project-status.enum';


@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private teamsService: TeamsService,
    private usersService: UsersService,
  ) {}

  //create project services
  async create(createProjectDto: CreateProjectDto): Promise<ProjectResponseDto> {
    const createdProject = new this.projectModel(createProjectDto);
    const savedProject = await createdProject.save();
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
  async findById(id: string): Promise<ProjectResponseDto> {
    const project = await this.projectModel
      .findById(id)
      .populate('team', 'name')
      .populate('manager', 'name email')
      .populate('contributors', 'name email')
      .exec();
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
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
    const projects = await this.projectModel
      .find({ contributors: userId })
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
        id: (project.team as any)._id.toString(),
        name: (project.team as any).name,
      },
      manager: {
        id: (project.manager as any)._id.toString(),
        name: (project.manager as any).name,
        email: (project.manager as any).email,
      },
      startDate: project.startDate,
      deadline: project.deadline,
      status: project.status,
      progress: project.progress,
      completedAt: project.completedAt,
      contributors: project.contributors.map((contributor: any) => ({
        id: contributor._id.toString(),
        name: contributor.name,
        email: contributor.email,
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}