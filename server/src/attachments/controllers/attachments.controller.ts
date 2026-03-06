import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AttachmentsService } from '../services/attachments.service';

const filenameFactory = (
    _req: unknown,
    file: { originalname: string },
    cb: (error: Error | null, filename: string) => void,
) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
};

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.gif', '.txt', '.csv', '.zip'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const fileFilter = (
    _req: unknown,
    file: { originalname: string },
    cb: (error: Error | null, acceptFile: boolean) => void,
) => {
    const extension = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return cb(new BadRequestException('File type not allowed'), false);
    }
    cb(null, true);
};

@Controller()
@JwtAuthGuard()
export class AttachmentsController {
    constructor(private readonly attachmentsService: AttachmentsService) { }

    @Post('tasks/:id/attachments')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: filenameFactory,
            }),
            limits: { fileSize: MAX_FILE_SIZE },
            fileFilter,
        }),
    )
    async upload(
        @Param('id') taskId: string,
        @UploadedFile() file: { originalname: string; filename: string } | undefined,
        @CurrentUser() user: { id: string },
        @Body('fileName') fileName?: string,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const data = await this.attachmentsService.create({
            taskId,
            fileName: fileName || file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            uploadedBy: user.id,
        });

        return {
            success: true,
            message: 'Attachment uploaded successfully',
            data,
        };
    }

    @Get('tasks/:id/attachments')
    async getByTask(@Param('id') taskId: string) {
        const data = await this.attachmentsService.getByTask(taskId);
        return {
            success: true,
            message: 'Attachments fetched successfully',
            data,
        };
    }

    @Delete('attachments/:id')
    async remove(
        @Param('id') attachmentId: string,
        @CurrentUser() user: { id: string; role: string },
    ) {
        await this.attachmentsService.remove(attachmentId, user);
        return {
            success: true,
            message: 'Attachment removed successfully',
            data: null,
        };
    }
}


