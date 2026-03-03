export interface NotificationItem {
    _id: string;
    userId: string;
    message: string;
    type: string;
    relatedId?: string;
    readStatus: boolean;
    createdAt: string;
}

export interface ActivityItem {
    _id: string;
    actionType: string;
    performedBy?: { _id?: string; name?: string; email?: string };
    targetId?: string;
    description: string;
    createdAt: string;
}

export interface CommentItem {
    _id: string;
    taskId: string;
    userId?: { _id?: string; name?: string; email?: string };
    message: string;
    parentCommentId?: string;
    createdAt: string;
}

export interface AttachmentItem {
    _id: string;
    taskId: string;
    fileName: string;
    fileUrl: string;
    uploadedBy?: { _id?: string; name?: string; email?: string };
    createdAt: string;
}

