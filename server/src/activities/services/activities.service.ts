import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity } from '../schemas/activity.schema';
import { CreateActivityDto } from '../dtos/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private readonly activityModel: Model<Activity>,
  ) {}

  async create(input: CreateActivityDto): Promise<Activity> {
    const activity = new this.activityModel(input);
    return activity.save();
  }

  async getAll(actionType?: string): Promise<Activity[]> {
    const filter = actionType ? { actionType } : {};
    return this.activityModel
      .find(filter)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .exec();
  }
}
