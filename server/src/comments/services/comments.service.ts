import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/enums/role.enum';
import { TasksService } from 'src/tasks/services/tasks.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { ActivitiesService } from 'src/activities/services/activities.service';
import { Comment } from '../schemas/comment.schema';
import { CreateCommentDto } from '../dtos/comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    private readonly tasksService: TasksService,
    private readonly notificationsService: NotificationsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(taskId: string, userId: string, dto: CreateCommentDto) {
    const task = await this.tasksService.findById(taskId);

    const comment = await new this.commentModel({
      taskId,
      userId,
      message: dto.message,
      parentCommentId: dto.parentCommentId,
    }).save();

    if (task.assignedTo && task.assignedTo.length > 0) {
      for (const assignee of task.assignedTo) {
        if (assignee._id !== userId) {
          await this.notificationsService.create({
            userId: assignee._id,
            title: 'New Comment',
            message: `New comment on task: ${task.title}`,
            type: 'task_comment_added',
            relatedId: taskId,
          });
        }
      }
    }

    await this.activitiesService.create({
      actionType: 'task_updated',
      performedBy: userId,
      targetId: taskId,
      description: `Comment added on task '${task.title}'`,
    });

    return this.commentModel
      .findById(comment._id)
      .populate('userId', 'name email role')
      .populate('parentCommentId', 'message userId')
      .exec();
  }

  async getByTask(taskId: string) {
    await this.tasksService.findById(taskId);

    return this.commentModel
      .find({ taskId })
      .populate('userId', 'name email role')
      .sort({ createdAt: 1 })
      .exec();
  }

  async remove(commentId: string, currentUser: { id: string; role: string }) {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isOwner = comment.userId.toString() === currentUser.id;
    const isManager = currentUser.role?.toLowerCase() === Role.MANAGER;
    const isAdmin = currentUser.role?.toLowerCase() === Role.ADMIN;

    if (!isOwner && !isManager && !isAdmin) {
      throw new ForbiddenException('You are not allowed to delete this comment');
    }

    await this.commentModel.findByIdAndDelete(commentId).exec();
  }
}

