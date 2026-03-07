import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ required: true, trim: true })
  actionType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  performedBy: Types.ObjectId;

  @Prop({ trim: true })
  targetId?: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
