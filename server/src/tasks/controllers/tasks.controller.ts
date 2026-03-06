import { Controller, Get, Post, Body, Patch, Param,Delete,UseGuards,Query, Put 
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TasksService } from '../services/tasks.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/tasks.dto';
import { SingleTaskResponseDto, TaskListResponseDto } from '../responses/tasks.response';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Roles(Role.MEMBER, Role.MANAGER, Role.ADMIN) // optional restriction
  @UseGuards(RolesGuard)
  @JwtAuthGuard() // must be logged in
  @Get('my-tasks')
  async getMyTasks(@CurrentUser() user: any) {
    return this.tasksService.getMyTasks(user.id);
  }
  
  @Roles(Role.MEMBER, Role.MANAGER, Role.ADMIN) // optional restriction
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get('due-soon')
  async getTasksDueSoon(@Query('days') days?: number):      Promise<TaskListResponseDto> {
    const tasks = await this.tasksService.getTasksDueSoon(days ? Number(days) : 3);
    return {
      success: true,
      data: tasks,
      message: 'Tasks due soon retrieved',
    };
  }
  

  @Roles(Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: { id: string },
  ): Promise<SingleTaskResponseDto> {
    createTaskDto.createdBy = createTaskDto.createdBy || user.id;
    const task = await this.tasksService.create(createTaskDto);
    return {
      success: true,
      data: task,
      message: 'Task created successfully',
    };
  }
  
  @Roles(Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get()
  async findAll(): Promise<TaskListResponseDto> {
    const tasks = await this.tasksService.findAll();
    return {
      success: true,
      data: tasks,
      message: 'Tasks retrieved successfully',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER,Role.MEMBER )
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get('overdue')
  async getOverdueTasks(): Promise<TaskListResponseDto> {
    const tasks = await this.tasksService.getOverdueTasks();
    return {
      success: true,
      data: tasks,
      message: 'Overdue tasks retrieved',
    };
  }

  @Roles(Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SingleTaskResponseDto> {
    const task = await this.tasksService.findById(id);
    return {
      success: true,
      data: task,
      message: 'Task retrieved successfully',
    };
  }

  @Roles(Role.MANAGER, Role.MEMBER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<SingleTaskResponseDto> {
    const task = await this.tasksService.update(id, updateTaskDto);
    return {
      success: true,
      data: task,
      message: 'Task updated successfully',
    };
  }

  @Roles(Role.MANAGER, Role.MEMBER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Put(':id')
  async updateViaPut(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<SingleTaskResponseDto> {
    const task = await this.tasksService.update(id, updateTaskDto);
    return {
      success: true,
      data: task,
      message: 'Task updated successfully',
    };
  }

  @Roles(Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return await this.tasksService.remove(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get('project/:projectId')
  async getTasksByProject(@Param('projectId') projectId: string): Promise<TaskListResponseDto> {
    const tasks = await this.tasksService.getTasksByProject(projectId);
    return {
      success: true,
      data: tasks,
      message: 'Tasks retrieved by project',
    };
  }

  @Roles(Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get('user/:userId')
  async getTasksByUser(@Param('userId') userId: string): Promise<TaskListResponseDto> {
    const tasks = await this.tasksService.getTasksByUser(userId);
    return {
      success: true,
      data: tasks,
      message: 'Tasks retrieved by user',
    };
  }


  @Roles(Role.ADMIN,Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get('creator/:userId')
  async getTasksByCreator(@Param('userId') userId: string): Promise<TaskListResponseDto> {
    const tasks = await this.tasksService.getTasksByCreator(userId);
    return {
      success: true,
      data: tasks,
      message: 'Tasks retrieved by creator',
    };
  }

  @Roles(Role.MANAGER, Role.MEMBER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body('percentageComplete') percentageComplete: number,
  ): Promise<SingleTaskResponseDto> {
    const task = await this.tasksService.updateTaskProgress(id, percentageComplete);
    return {
      success: true,
      data: task,
      message: 'Task progress updated successfully',
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Post(':taskId/dependencies/:dependencyId')
  async addDependency(
    @Param('taskId') taskId: string,
    @Param('dependencyId') dependencyId: string,
  ): Promise<SingleTaskResponseDto> {
    const task = await this.tasksService.addDependency(taskId, dependencyId);
    return {
      success: true,
      data: task,
      message: 'Dependency added successfully',
    };
  }
  
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Delete(':taskId/dependencies/:dependencyId')
  async removeDependency(
    @Param('taskId') taskId: string,
    @Param('dependencyId') dependencyId: string,
  ): Promise<SingleTaskResponseDto> {
    const task = await this.tasksService.removeDependency(taskId, dependencyId);
    return {
      success: true,
      data: task,
      message: 'Dependency removed successfully',
    };
  }

   @Roles(Role.ADMIN, Role.MANAGER)
   @UseGuards(RolesGuard)
   @JwtAuthGuard()
   @Get('statistics/:projectId')
    async getTaskStatistics(@Param('projectId') projectId: string): Promise<any> {
    const statistics = await this.tasksService.getTaskStatistics(projectId);
    return {
    success: true,
    data: statistics,
    message: 'Task statistics retrieved',
    };
  }

}
