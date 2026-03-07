import React, { useEffect, useState, useCallback } from 'react';
import { getMyTasks } from '../../services/dashboardService';
import api from '../../services/api';
import { Search, ListTodo, Clock, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { collaborationService } from '../../services/collaborationService';
import type { AttachmentItem, CommentItem } from '../../types/collaboration';
import { useNavigate } from 'react-router-dom';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline: string;
  progress?: number;
  percentageComplete?: number;
  project?: { _id: string; name: string };
}

// --- Reusable styles (extracted for consistency) ---
const styles = {
  container: { padding: '24px 32px' },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  filters: { display: 'flex', gap: 12, marginBottom: 20 },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fff',
    borderRadius: 10,
    padding: '8px 16px',
    flex: 1,
    maxWidth: 400,
    border: '1px solid #e5e7eb',
  },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 14, flex: 1 },
  select: { padding: '8px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, background: '#fff' },
  taskList: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
  taskCard: (isOverdue: boolean) => ({
    background: '#fff',
    borderRadius: 14,
    padding: '18px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: `1px solid ${isOverdue ? '#fecaca' : '#f3f4f6'}`,
    transition: 'transform 0.15s',
    cursor: 'pointer',
  }),
  emptyState: { padding: 40, textAlign: 'center' as const, color: '#9ca3af', background: '#fff', borderRadius: 16 },
  panel: {
    marginTop: 20,
    background: '#fff',
    border: '1px solid #f3f4f6',
    borderRadius: 12,
    padding: 16,
    position: 'relative' as const,
  },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 },
  panelGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  commentsBox: { maxHeight: 180, overflowY: 'auto' as const, border: '1px solid #f3f4f6', borderRadius: 8, padding: 8 },
  commentItem: { padding: '6px 0', borderBottom: '1px solid #f3f4f6' },
  commentMeta: { fontSize: 12, color: '#6b7280' },
  commentText: { fontSize: 13 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' },
  btnPrimary: { padding: '10px 20px', borderRadius: 10, border: 'none', background: '#0f5841', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  btnDanger: { border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' },
  attachmentLink: { color: '#2563eb', textDecoration: 'none' },
  progressContainer: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  progressBar: { flex: 1, height: 5, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' },
  progressFill: (width: number) => ({ width: `${width}%`, height: '100%', borderRadius: 3, background: '#334155' }),
  progressRange: { width: 80 },
  metaInfo: { fontSize: 12, display: 'flex', gap: 12, alignItems: 'center' },
  overdue: { color: '#ef4444' },
  projectLink: { cursor: 'pointer', textDecoration: 'underline' },
};

// Helper functions
const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    completed: '#10b981',
    'in-progress': '#3b82f6',
    in_progress: '#3b82f6',
    todo: '#9ca3af',
    'not-started': '#9ca3af',
  };
  return map[status?.toLowerCase()] || '#6b7280';
};

const getPriorityStyle = (priority: string): { bg: string; color: string } => {
  const map: Record<string, { bg: string; color: string }> = {
    high: { bg: '#fee2e2', color: '#dc2626' },
    critical: { bg: '#fee2e2', color: '#dc2626' },
    medium: { bg: '#fef3c7', color: '#d97706' },
    low: { bg: '#d1fae5', color: '#059669' },
  };
  return map[priority?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };
};

const formatDate = (date: string): string => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [panelLoading, setPanelLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getMyTasks();
        const data = res.data || res;
        setTasks(Array.isArray(data) ? data : data?.tasks || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Load collaboration data for selected task
  const loadTaskCollaboration = useCallback(async (taskId: string) => {
    setSelectedTaskId(taskId);
    setPanelLoading(true);
    try {
      const [commentsData, attachmentsData] = await Promise.all([
        collaborationService.getTaskComments(taskId),
        collaborationService.getTaskAttachments(taskId),
      ]);
      setComments(commentsData);
      setAttachments(attachmentsData);
    } catch (error) {
      toast.error('Failed to load collaboration data');
      console.error(error);
    } finally {
      setPanelLoading(false);
    }
  }, []);

  // Close collaboration panel
  const closePanel = () => {
    setSelectedTaskId(null);
    setComments([]);
    setAttachments([]);
    setCommentInput('');
  };

  // Add comment
  const handleAddComment = async () => {
    if (!selectedTaskId || !commentInput.trim()) return;
    try {
      await collaborationService.addTaskComment(selectedTaskId, commentInput.trim());
      setCommentInput('');
      await loadTaskCollaboration(selectedTaskId); // refresh
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  // Upload attachment
  const handleUploadAttachment = async (file: File | null) => {
    if (!selectedTaskId || !file) return;
    try {
      await collaborationService.uploadTaskAttachment(selectedTaskId, file);
      await loadTaskCollaboration(selectedTaskId);
      toast.success('Attachment uploaded');
    } catch (error) {
      toast.error('Failed to upload attachment');
    }
  };

  // Delete attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await collaborationService.deleteAttachment(attachmentId);
      await loadTaskCollaboration(selectedTaskId!);
      toast.success('Attachment deleted');
    } catch (error) {
      toast.error('Failed to delete attachment');
    }
  };

  // Update task status
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${id}`, { status: newStatus });
      toast.success('Status updated');
    } catch (err: any) {
      console.error('status update error', err.response || err);
      const msg = err.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    } finally {
      // in any case, refresh tasks so the UI matches server state
      try {
        const res = await getMyTasks();
        const data = res.data || res;
        setTasks(Array.isArray(data) ? data : data?.tasks || []);
      } catch (err) {
        console.error('error refreshing tasks after status change', err);
      }
    }
  };

  // Update task progress
  const handleProgressChange = async (id: string, percentageComplete: number) => {
    try {
      await api.patch(`/tasks/${id}/progress`, { percentageComplete });
      toast.success('Progress updated');
      setTasks((prev) =>
        prev.map((task) =>
          task._id === id
            ? { ...task, percentageComplete, progress: percentageComplete }
            : task
        )
      );
    } catch (err: any) {
      console.error('progress update error', err.response || err);
      const msg = err.response?.data?.message || 'Failed to update progress';
      toast.error(msg);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Tasks</h1>
        <p style={styles.subtitle}>{tasks.length} tasks assigned to you</p>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.searchBox}>
          <Search size={16} color="#9ca3af" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            style={styles.searchInput}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task List */}
      <div style={styles.taskList}>
        {loading ? (
          <div style={styles.emptyState}>Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div style={styles.emptyState}>
            <ListTodo size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
            <p>No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
            return (
              <div
                key={task._id}
                style={styles.taskCard(isOverdue)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
              >
                {/* Task Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => handleStatusChange(task._id, task.status === 'completed' ? 'pending' : 'completed')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <CheckCircle2
                        size={20}
                        color={task.status === 'completed' ? '#10b981' : '#d1d5db'}
                        fill={task.status === 'completed' ? '#d1fae5' : 'none'}
                      />
                    </button>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: '#111827',
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => loadTaskCollaboration(task._id)}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span
                      style={{
                        background: getPriorityStyle(task.priority).bg,
                        color: getPriorityStyle(task.priority).color,
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {task.priority}
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: 'none',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#fff',
                        background: getStatusColor(task.status),
                        cursor: 'pointer',
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Progress Bar (if available) */}
                {(task.percentageComplete !== undefined || task.progress !== undefined) && (
                  <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                      <div
                        style={styles.progressFill(task.percentageComplete ?? task.progress ?? 0)}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                      {task.percentageComplete ?? task.progress ?? 0}%
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={task.percentageComplete ?? task.progress ?? 0}
                      onChange={(e) => handleProgressChange(task._id, Number(e.target.value))}
                      style={styles.progressRange}
                    />
                  </div>
                )}

                {/* Metadata */}
                <div style={{ ...styles.metaInfo, color: isOverdue ? '#ef4444' : '#9ca3af' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {formatDate(task.deadline)}
                  </span>
                  {task.project?.name && (
                    <span
                      onClick={() => task.project?._id && navigate(`/dashboard/projects/${task.project._id}`)}
                      style={styles.projectLink}
                    >
                      • {task.project.name}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Collaboration Panel (shown when a task is selected) */}
      {selectedTaskId && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={{ margin: 0 }}>Task Collaboration</h3>
            <button onClick={closePanel} style={styles.closeButton}>
              <X size={18} />
            </button>
          </div>

          {panelLoading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>Loading...</div>
          ) : (
            <div style={styles.panelGrid}>
              {/* Comments Section */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Comments</h4>
                <div style={styles.commentsBox}>
                  {comments.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9ca3af' }}>No comments yet</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c._id} style={styles.commentItem}>
                        <div style={styles.commentMeta}>
                          {c.userId?.name || 'User'} • {new Date(c.createdAt).toLocaleString()}
                        </div>
                        <div style={styles.commentText}>{c.message}</div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add comment..."
                    style={styles.input}
                  />
                  <button onClick={handleAddComment} style={styles.btnPrimary}>
                    Post
                  </button>
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Attachments</h4>
                <input
                  type="file"
                  onChange={(e) => handleUploadAttachment(e.target.files?.[0] || null)}
                />
                <div style={{ marginTop: 8, maxHeight: 180, overflowY: 'auto' as const }}>
                  {attachments.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9ca3af' }}>No attachments</p>
                  ) : (
                    attachments.map((a) => {
                      // Build full attachment URL (adjust if needed)
                      const baseUrl = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
                      const fileUrl = a.fileUrl.startsWith('http')
                        ? a.fileUrl
                        : `${baseUrl}${a.fileUrl}`;
                      return (
                        <div
                          key={a._id}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}
                        >
                          <a href={fileUrl} target="_blank" rel="noreferrer" style={styles.attachmentLink}>
                            {a.fileName}
                          </a>
                          <button
                            onClick={() => handleDeleteAttachment(a._id)}
                            style={styles.btnDanger}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;