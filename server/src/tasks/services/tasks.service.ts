import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from '../schemas/tasks.schema';
import { Project } from 'src/projects/schemas/project.schema';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/tasks.dto';
import { TaskResponseDto } from '../responses/tasks.response';
import { TaskStatus } from 'src/enums/task-status.enum';
import { NotificationsService } from 'src/notifications/services/notifications.service';


@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly notificationsService: NotificationsService,
  ) { }

  // Create a new task
  async create(createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    // If status is being set to in_progress, set startedAt if not provided
    if (createTaskDto.status === TaskStatus.IN_PROGRESS && !createTaskDto.startedAt) {
      createTaskDto.startedAt = new Date();
    }

    // If status is being set to completed, set completedAt and percentageComplete to 100
    if (createTaskDto.status === TaskStatus.COMPLETED) {
      createTaskDto.completedAt = new Date();
      createTaskDto.percentageComplete = 100;
    }

    const createdTask = new this.taskModel(createTaskDto);
    const savedTask = await createdTask.save();

    if (savedTask.assignedTo && savedTask.assignedTo.length > 0) {
      for (const assignee of savedTask.assignedTo) {
        await this.notificationsService.create({
          userId: assignee.toString(),
          title: 'Task Assigned',
          message: `A new task '${savedTask.title}' has been assigned to you`,
          type: 'task_assigned',
          relatedId: savedTask._id.toString(),
        });
      }
    }

    return this.getTaskWithDetails(savedTask._id.toString());
  }

  // Get all tasks with populated references
  async findAll(): Promise<TaskResponseDto[]> {
    const tasks = await this.taskModel
      .find()
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title')
      .exec();

    return Promise.all(tasks.map(task => this.mapToResponseDto(task)));
  }

  async findByProject(projectId: string, user?: { id: string; role: string }): Promise<TaskResponseDto[]> {
    // Check if user has access to the project
    if (user && user.role.toLowerCase() === 'member') {
      const project = await this.projectModel.findById(projectId).select('contributors').exec();
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
      const isContributor = project.contributors?.some(
        contributor => contributor.toString() === user.id
      );
      if (!isContributor) {
        throw new ForbiddenException('You do not have permission to view tasks for this project');
      }
    }

    const tasks = await this.taskModel
      .find({ project: projectId })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title')
      .exec();

    return Promise.all(tasks.map(task => this.mapToResponseDto(task)));
  }

  //Get a Single Task by ID with populated references
  async findById(id: string): Promise<TaskResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Task ID');
    }

    const task = await this.taskModel
      .findById(id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title')
      .exec();


    if (!task) {
      throw new BadRequestException(`Task with ID ${id} not found`);
    }

    return this.mapToResponseDto(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskResponseDto> {
    const beforeUpdate = await this.taskModel.findById(id).select('assignedTo title percentageComplete').populate('project', 'manager').exec();
    
    // If status is being updated to in_progress, set startedAt if not provided
    if (updateTaskDto.status === 'in_progress' && !updateTaskDto.startedAt) {
      updateTaskDto.startedAt = new Date();
    }

    // If status is being updated to completed, set completedAt and percentageComplete to 100
    if (updateTaskDto.status === 'completed') {
      updateTaskDto.completedAt = new Date();
      updateTaskDto.percentageComplete = 100;
    }

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true, runValidators: true })
      .populate('project', 'name manager')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const previousAssignees = beforeUpdate?.assignedTo?.map(a => a.toString()) || [];
    const nextAssignees = updatedTask.assignedTo?.map(a => a.toString()) || [];
    const newAssignees = nextAssignees.filter(a => !previousAssignees.includes(a));
    for (const assignee of newAssignees) {
      await this.notificationsService.create({
        userId: assignee,
        title: 'Task Assignment Update',
        message: `Task '${updatedTask.title}' has been assigned to you`,
        type: 'task_assigned',
        relatedId: updatedTask._id.toString(),
      });
    }

    // Notify project manager when task progress is updated
    if (updateTaskDto.percentageComplete !== undefined && 
        beforeUpdate?.percentageComplete !== updateTaskDto.percentageComplete &&
        updatedTask.project && (updatedTask.project as any).manager) {
      const managerId = (updatedTask.project as any).manager.toString();
      await this.notificationsService.create({
        userId: managerId,
        title: 'Task Progress Update',
        message: `Task '${updatedTask.title}' progress updated to ${updateTaskDto.percentageComplete}%`,
        type: 'task_progress',
        relatedId: updatedTask._id.toString(),
      });
    }

    return this.mapToResponseDto(updatedTask);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.taskModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Task deleted successfully',
    };
  }

  async getTasksByProject(projectId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.taskModel
      .find({ project: projectId })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title')
      .exec();

    return Promise.all(tasks.map(task => this.mapToResponseDto(task)));
  }

  async getTasksByUser(userId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.taskModel
      .find({ assignedTo: userId })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title')
      .exec();

    return Promise.all(tasks.map(task => this.mapToResponseDto(task)));
  }


  async getMyTasks(userId: string): Promise<Task[]> {
    return this.taskModel
      .find({
        assignedTo: new Types.ObjectId(userId), // 🔥 filter by logged user
      })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTasksByCreator(userId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.taskModel
      .find({ createdBy: userId })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title')
      .exec();

    return Promise.all(tasks.map(task => this.mapToResponseDto(task)));
  }

  async updateTaskProgress(id: string, percentageComplete: number): Promise<TaskResponseDto> {
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Validate percentage
    if (percentageComplete < 0 || percentageComplete > 100) {
      throw new BadRequestException('Percentage must be between 0 and 100');
    }

    task.percentageComplete = percentageComplete;

    // Update status based on percentage
    if (percentageComplete >= 100) {
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
    } else if (percentageComplete > 0 && task.status === TaskStatus.PENDING) {
      task.status = TaskStatus.IN_PROGRESS;
      task.startedAt = task.startedAt || new Date();
    }

    await task.save();
    return this.getTaskWithDetails(id);
  }

  async addDependency(taskId: string, dependencyId: string): Promise<TaskResponseDto> {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Check if dependency is already added
    if (!task.dependencies.includes(dependencyId as any)) {
      task.dependencies.push(dependencyId as any);
      await task.save();
    }

    return this.getTaskWithDetails(taskId);
  }

  async removeDependency(taskId: string, dependencyId: string): Promise<TaskResponseDto> {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    task.dependencies = task.dependencies.filter(depId =>
      depId.toString() !== dependencyId
    );
    await task.save();

    return this.getTaskWithDetails(taskId);
  }

  async getOverdueTasks(): Promise<TaskResponseDto[]> {
    const now = new Date();
    const tasks = await this.taskModel
      .find({
        deadline: { $lt: now },
        status: { $ne: TaskStatus.COMPLETED },
      })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title')
      .exec();

    return Promise.all(tasks.map(task => this.mapToResponseDto(task)));
  }


  async getTasksDueSoon(days: number = 3): Promise<TaskResponseDto[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const tasks = await this.taskModel
      .find({
        deadline: { $gte: now, $lte: futureDate },
        status: { $ne: 'completed' },
      })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title')
      .exec();

    return Promise.all(tasks.map(task => this.mapToResponseDto(task)));
  }

  async getTaskStatistics(projectId?: string): Promise<any> {
    const filter: any = {};
    if (projectId) {
      filter.project = projectId;
    }

    const tasks = await this.taskModel.find(filter).exec();

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const blocked = tasks.filter(t => t.status === 'blocked');

    const averageCompletion = total > 0 ? tasks.reduce((sum, t) => sum + t.percentageComplete, 0) / total : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      blocked: blocked.length,
      averageCompletion,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  private async getTaskWithDetails(taskId: string): Promise<TaskResponseDto> {
    const task = await this.taskModel
      .findById(taskId)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title')
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return this.mapToResponseDto(task);
  }

  private async mapToResponseDto(task: Task): Promise<TaskResponseDto> {
    return {
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      project: task.project ? {
        _id: (task.project as any)._id.toString(),
        name: (task.project as any).name,
      } : undefined,
      assignedTo: task.assignedTo ? (task.assignedTo as any[]).map((a: any) => ({
        _id: a._id.toString(),
        name: a.name,
        email: a.email,
      })) : [],
      createdBy: task.createdBy ? {
        _id: (task.createdBy as any)._id.toString(),
        name: (task.createdBy as any).name,
        email: (task.createdBy as any).email,
      } : undefined,
      status: task.status,
      percentageComplete: task.percentageComplete,
      priority: task.priority,
      deadline: task.deadline,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      dependencies: task.dependencies ? task.dependencies.map((dep: any) => dep._id.toString()) : [],
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      comments: task.comments,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

