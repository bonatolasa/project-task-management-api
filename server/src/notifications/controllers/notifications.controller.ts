import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { NotificationsService } from '../services/notifications.service';

@Controller('notifications')
@JwtAuthGuard()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getMine(@CurrentUser() user: { id: string }) {
        const notifications = await this.notificationsService.findByUser(user.id);
        return {
            success: true,
            message: 'Notifications fetched successfully',
            data: notifications,
        };
    }

    @Patch(':id/read')
    async markRead(@Param('id') id: string, @CurrentUser() user: { id: string }) {
        const notification = await this.notificationsService.markAsRead(id, user.id);
        return {
            success: true,
            message: 'Notification marked as read',
            data: notification,
        };
    }

    @Patch('read-all')
    async markAllRead(@CurrentUser() user: { id: string }) {
        await this.notificationsService.markAllAsRead(user.id);
        return {
            success: true,
            message: 'All notifications marked as read',
            data: null,
        };
    }

    @Delete(':id')
    async deleteOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
        await this.notificationsService.remove(id, user.id);
        return {
            success: true,
            message: 'Notification deleted',
            data: null,
        };
    }
}

