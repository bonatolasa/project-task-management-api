import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Team extends Document {
  @Prop({ required: true }) name: string;
  @Prop()  description: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })  manager: string;
  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])  members: string[];
  @Prop({ default: true })  isActive: boolean;
}

export const TeamSchema = SchemaFactory.createForClass(Team);