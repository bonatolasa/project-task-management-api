import { Controller, Delete, Get, Param, Post, Body } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dtos/comments.dto';

@Controller()
@JwtAuthGuard()
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post('tasks/:id/comments')
    async create(
        @Param('id') taskId: string,
        @Body() dto: CreateCommentDto,
        @CurrentUser() user: { id: string },
    ) {
        const data = await this.commentsService.create(taskId, user.id, dto);
        return {
            success: true,
            message: 'Comment added successfully',
            data,
        };
    }

    @Get('tasks/:id/comments')
    async getByTask(@Param('id') taskId: string) {
        const data = await this.commentsService.getByTask(taskId);
        return {
            success: true,
            message: 'Comments fetched successfully',
            data,
        };
    }

    @Delete('comments/:id')
    async remove(
        @Param('id') commentId: string,
        @CurrentUser() user: { id: string; role: string },
    ) {
        await this.commentsService.remove(commentId, user);
        return {
            success: true,
            message: 'Comment deleted successfully',
            data: null,
        };
    }
}

