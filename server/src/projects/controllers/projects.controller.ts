import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ProjectsService } from '../services/projects.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { CreateProjectDto, UpdateProjectDto } from '../dtos/project.dto';
import {
  ProjectListResponseDto,
  SingleProjectResponseDto,
} from '../responses/project.response';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Roles(Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: { id: string },
  ): Promise<SingleProjectResponseDto> {
    try {
      createProjectDto.manager = createProjectDto.manager || user.id;
      createProjectDto.startDate = createProjectDto.startDate || new Date();
      const project = await this.projectsService.create(createProjectDto);
      return {
        success: true,
        data: project,
        message: 'Project created successfully',
      };
    } catch (err) {
      // Log the error for debugging and return a generic 500 message
      // The stack will appear in the server console

      console.error('Error in ProjectsController.create:', err);
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get()
  async findAll(): Promise<ProjectListResponseDto> {
    const projects = await this.projectsService.findAll();
    return {
      success: true,
      data: projects,
      message: 'Projects retrieved successfully',
    };
  }

  @Roles(Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.update(id, updateProjectDto);
    return {
      success: true,
      data: project,
      message: 'Project updated successfully',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return await this.projectsService.remove(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get('team/:teamId')
  async getProjectsByTeam(
    @Param('teamId') teamId: string,
  ): Promise<ProjectListResponseDto> {
    const projects = await this.projectsService.getProjectsByTeam(teamId);
    return {
      success: true,
      data: projects,
      message: 'Projects retrieved by team',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get('manager/:managerId')
  async getProjectsByManager(
    @Param('managerId') managerId: string,
  ): Promise<ProjectListResponseDto> {
    const projects = await this.projectsService.getProjectsByManager(managerId);
    return {
      success: true,
      data: projects,
      message: 'Projects retrieved by manager',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get('contributor/:userId')
  async getProjectsByContributor(
    @Param('userId') userId: string,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<ProjectListResponseDto> {
    // Members can only see their own projects
    if (user.role.toLowerCase() === 'member' && user.id !== userId) {
      throw new ForbiddenException('You can only view your own projects');
    }
    const projects =
      await this.projectsService.getProjectsByContributor(userId);
    return {
      success: true,
      data: projects,
      message: 'Projects retrieved by contributor',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Post(':projectId/contributors/:userId')
  async addContributor(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.addContributor(
      projectId,
      userId,
    );
    return {
      success: true,
      data: project,
      message: 'Contributor added to project successfully',
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Delete(':projectId/contributors/:userId')
  async removeContributor(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.removeContributor(
      projectId,
      userId,
    );
    return {
      success: true,
      data: project,
      message: 'Contributor removed from project successfully',
    };
  }

  @JwtAuthGuard()
  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body('progress') progress: number,
  ): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.updateProgress(id, progress);
    return {
      success: true,
      data: project,
      message: 'Project progress updated successfully',
    };
  }

  @JwtAuthGuard()
  @Get('overdue')
  async getOverdueProjects(): Promise<ProjectListResponseDto> {
    const projects = await this.projectsService.getOverdueProjects();
    return {
      success: true,
      data: projects,
      message: 'Overdue projects retrieved',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.findById(id, user);
    return {
      success: true,
      data: project,
      message: 'Project retrieved successfully',
    };
  }
}
