import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/enums/role.enum';
import { Attachment } from '../schemas/attachment.schema';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name)
    private readonly attachmentModel: Model<Attachment>,
  ) {}

  async create(input: {
    taskId: string;
    fileName: string;
    fileUrl: string;
    uploadedBy: string;
  }) {
    const attachment = new this.attachmentModel(input);
    return attachment.save();
  }

  async getByTask(taskId: string) {
    return this.attachmentModel
      .find({ taskId })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async remove(
    attachmentId: string,
    currentUser: { id: string; role: string },
  ) {
    const attachment = await this.attachmentModel.findById(attachmentId).exec();
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const isOwner = attachment.uploadedBy.toString() === currentUser.id;
    const isManager = currentUser.role?.toLowerCase() === Role.MANAGER;
    const isAdmin = currentUser.role?.toLowerCase() === Role.ADMIN;

    if (!isOwner && !isManager && !isAdmin) {
      throw new ForbiddenException('Not allowed to remove this attachment');
    }

    await this.attachmentModel.findByIdAndDelete(attachmentId).exec();
  }
}
