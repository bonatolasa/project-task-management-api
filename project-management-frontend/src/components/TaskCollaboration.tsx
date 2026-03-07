import React, { useState, useEffect, useCallback } from 'react';
import { collaborationService } from '../services/collaborationService';
import type { CommentItem, AttachmentItem } from '../types/collaboration';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Trash2, FileText, Download, Send, Paperclip } from 'lucide-react';

interface TaskCollaborationProps {
    taskId: string;
}

const TaskCollaboration: React.FC<TaskCollaborationProps> = ({ taskId }) => {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [commentInput, setCommentInput] = useState('');
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!taskId) return;
        setLoading(true);
        try {
            const [cData, aData] = await Promise.all([
                collaborationService.getTaskComments(taskId),
                collaborationService.getTaskAttachments(taskId),
            ]);
            setComments(cData);
            setAttachments(aData);
        } catch (error) {
            console.error('Failed to load collaboration data', error);
            toast.error('Failed to load comments and attachments');
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddComment = async () => {
        if (!commentInput.trim()) return;
        try {
            await collaborationService.addTaskComment(taskId, commentInput.trim());
            setCommentInput('');
            await loadData();
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const handleUploadAttachment = async (file: File | null) => {
        if (!file) return;
        try {
            await collaborationService.uploadTaskAttachment(taskId, file);
            await loadData();
            toast.success('File uploaded');
        } catch (error) {
            toast.error('Failed to upload file');
        }
    };

    const handleDeleteAttachment = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this attachment?')) return;
        try {
            await collaborationService.deleteAttachment(id);
            await loadData();
            toast.success('Attachment removed');
        } catch (error) {
            toast.error('Failed to remove attachment');
        }
    };

    const handleDownload = async (fileUrl: string, fileName: string) => {
        try {
            // Remove redundant /api prefix if present because axios baseURL already includes it
            const sanitizedUrl = fileUrl.startsWith('/api') ? fileUrl.replace('/api', '') : fileUrl;

            const response = await api.get(sanitizedUrl, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed', error);
            toast.error('Failed to download file');
        }
    };


    const styles = {
        container: {
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6',
        },
        header: {
            fontSize: '20px',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '24px',
            borderBottom: '1px solid #f3f4f6',
            paddingBottom: '12px',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
        },
        sectionTitle: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        listContainer: {
            maxHeight: '300px',
            overflowY: 'auto' as const,
            marginBottom: '16px',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #f3f4f6',
            background: '#f9fafb',
        },
        commentItem: {
            padding: '12px',
            background: '#fff',
            borderRadius: '8px',
            marginBottom: '8px',
            border: '1px solid #e5e7eb',
        },
        commentMeta: {
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px',
            display: 'flex',
            justifyContent: 'space-between',
        },
        commentText: {
            fontSize: '14px',
            color: '#1f2937',
            lineHeight: 1.5,
        },
        attachmentItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: '#fff',
            borderRadius: '8px',
            marginBottom: '8px',
            border: '1px solid #e5e7eb',
        },
        attachmentInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: '#1f2937',
            textDecoration: 'none',
            flex: 1,
        },
        inputGroup: {
            display: 'flex',
            gap: '8px',
        },
        input: {
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            outline: 'none',
        },
        postBtn: {
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: '#0f5841',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        fileInput: {
            fontSize: '14px',
            color: '#6b7280',
        },
        emptyText: {
            textAlign: 'center' as const,
            color: '#9ca3af',
            padding: '20px 0',
            fontSize: '14px',
        }
    };

    if (loading && comments.length === 0 && attachments.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Loading collaboration...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>Task Collaboration</div>

            <div style={styles.grid}>
                {/* Comments Section */}
                <div>
                    <div style={styles.sectionTitle}>Comments</div>
                    <div style={styles.listContainer}>
                        {comments.length === 0 ? (
                            <div style={styles.emptyText}>No comments yet. Start the conversation!</div>
                        ) : (
                            comments.map((c) => (
                                <div key={c._id} style={styles.commentItem}>
                                    <div style={styles.commentMeta}>
                                        <span style={{ fontWeight: 600 }}>{c.userId?.name || 'User'}</span>
                                        <span>{new Date(c.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                    </div>
                                    <div style={styles.commentText}>{c.message}</div>
                                </div>
                            ))
                        )}
                    </div>
                    <div style={styles.inputGroup}>
                        <input
                            style={styles.input}
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                            placeholder="Add comment..."
                        />
                        <button style={styles.postBtn} onClick={handleAddComment}>
                            <Send size={16} /> Post
                        </button>
                    </div>
                </div>

                {/* Attachments Section */}
                <div>
                    <div style={styles.sectionTitle}>Attachments</div>
                    <div style={styles.listContainer}>
                        {attachments.length === 0 ? (
                            <div style={styles.emptyText}>No files attached.</div>
                        ) : (
                            attachments.map((a) => (
                                <div key={a._id} style={styles.attachmentItem}>
                                    <div
                                        onClick={() => handleDownload(a.fileUrl, a.fileName)}
                                        style={{ ...styles.attachmentInfo, cursor: 'pointer' }}
                                        title="Download"
                                    >
                                        <FileText size={18} color="#6b7280" />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {a.fileName}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div
                                            onClick={() => handleDownload(a.fileUrl, a.fileName)}
                                            style={{ color: '#6b7280', cursor: 'pointer' }}
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAttachment(a._id)}
                                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div style={{ padding: '8px', border: '1px dashed #d1d5db', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Paperclip size={18} color="#6b7280" />
                        <input
                            type="file"
                            onChange={(e) => handleUploadAttachment(e.target.files?.[0] || null)}
                            style={styles.fileInput}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCollaboration;
