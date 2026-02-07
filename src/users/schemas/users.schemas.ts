import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema,Types } from 'mongoose';
import { Role } from '../../enums/role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })  name: string;
  @Prop({ required: true, unique: true, lowercase: true })  email: string;
  @Prop({ required: true }) password: string;
  @Prop({ required: true, enum: Role, default: Role.TEAM_MEMBER }) role: Role;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' }) team: string;
  @Prop({ default: true }) isActive: boolean;
  @Prop() lastLogin: Date;
  @Prop() refreshToken: string;
  @Prop() avatar: string;
  @Prop() createdAt:Date
  @Prop() updatedAt:Date;
}

export const UserSchema = SchemaFactory.createForClass(User);