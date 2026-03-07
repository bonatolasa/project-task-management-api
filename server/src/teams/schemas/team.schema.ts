import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Team extends Document {
  @Prop({ required: true }) name: string;
  @Prop() description: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  manager?: Types.ObjectId;
  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])
  members: Types.ObjectId[];
  @Prop({ default: true }) isActive: boolean;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
