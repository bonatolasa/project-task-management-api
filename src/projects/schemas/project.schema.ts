import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ProjectStatus } from '../../enums/project-status.enum';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team', required: true })
  team: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  manager: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  deadline: Date;

  @Prop({ enum: ProjectStatus, default: ProjectStatus.PLANNING })
  status: ProjectStatus;

  @Prop({ default: 0, min: 0, max: 100 })
  progress: number;

  @Prop()
  completedAt: Date;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])
  contributors: string[];

  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);