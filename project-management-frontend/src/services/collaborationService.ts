import api from './api';
import type {
    ActivityItem,
    AttachmentItem,
    CommentItem,
    NotificationItem,
} from '../types/collaboration';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const collaborationService = {
    getNotifications: async (): Promise<NotificationItem[]> => {
        const res = await api.get<ApiResponse<NotificationItem[]>>('/notifications');
        return res.data.data || [];
    },

    markNotificationRead: async (id: string): Promise<void> => {
        await api.patch(`/notifications/${id}/read`);
    },

    markAllNotificationsRead: async (): Promise<void> => {
        await api.patch('/notifications/read-all');
    },

    getActivities: async (actionType?: string): Promise<ActivityItem[]> => {
        const query = actionType ? `?actionType=${encodeURIComponent(actionType)}` : '';
        const res = await api.get<ApiResponse<ActivityItem[]>>(`/activities${query}`);
        return res.data.data || [];
    },

    getTaskComments: async (taskId: string): Promise<CommentItem[]> => {
        const res = await api.get<ApiResponse<CommentItem[]>>(`/tasks/${taskId}/comments`);
        return res.data.data || [];
    },

    addTaskComment: async (taskId: string, message: string): Promise<CommentItem> => {
        const res = await api.post<ApiResponse<CommentItem>>(`/tasks/${taskId}/comments`, {
            message,
        });
        return res.data.data;
    },

    deleteComment: async (commentId: string): Promise<void> => {
        await api.delete(`/comments/${commentId}`);
    },

    getTaskAttachments: async (taskId: string): Promise<AttachmentItem[]> => {
        const res = await api.get<ApiResponse<AttachmentItem[]>>(
            `/tasks/${taskId}/attachments`,
        );
        return res.data.data || [];
    },

    uploadTaskAttachment: async (
        taskId: string,
        file: File,
    ): Promise<AttachmentItem> => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post<ApiResponse<AttachmentItem>>(
            `/tasks/${taskId}/attachments`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            },
        );
        return res.data.data;
    },

    deleteAttachment: async (attachmentId: string): Promise<void> => {
        await api.delete(`/attachments/${attachmentId}`);
    },
};

