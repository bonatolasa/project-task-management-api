import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { Plus, Search, Edit2, Trash2, ListTodo, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { collaborationService } from '../../services/collaborationService';
import type { AttachmentItem, CommentItem } from '../../types/collaboration';

interface Task {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    deadline: string;
    progress?: number;
    project?: { _id: string; name: string };
    assignedTo?: { _id?: string; id?: string; name: string };
}

interface MemberOption {
    _id?: string;
    id?: string;
    name: string;
}

interface ProjectOption {
    _id?: string;
    id?: string;
    name: string;
}

const getTaskId = (task: Task) => task.id || task._id || '';

const Tasks: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreate, setShowCreate] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [form, setForm] = useState({ title: '', description: '', status: 'pending', priority: 'medium', deadline: '', project: '', assignedTo: '' });
    const [members, setMembers] = useState<MemberOption[]>([]);
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [commentInput, setCommentInput] = useState('');

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks?limit=100');
            const data = res.data.data || res.data;
            const items = Array.isArray(data) ? data : data?.items || data?.tasks || [];
            setTasks(items);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTasks(); }, []);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get('/users/role/member');
                const data = res.data.data || [];
                setMembers(Array.isArray(data) ? data : []);
            } catch {
                setMembers([]);
            }
        };

        fetchMembers();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/projects/manager/${user.id}`);
                const data = res.data.data || [];
                setProjects(Array.isArray(data) ? data : []);
            } catch {
                setProjects([]);
            }
        };

        fetchProjects();
    }, [user?.id]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!form.title.trim()) return toast.error('Task title is required');
            await api.post('/tasks', {
                ...form,
                assignedTo: form.assignedTo || undefined,
            });
            toast.success('Task created!');
            setShowCreate(false);
            setForm({ title: '', description: '', status: 'pending', priority: 'medium', deadline: '', project: '', assignedTo: '' });
            fetchTasks();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTask) return;
        try {
            const editId = getTaskId(editTask);
            await api.put(`/tasks/${editId}`, {
                ...form,
                assignedTo: form.assignedTo || undefined,
            });
            toast.success('Task updated!');
            setEditTask(null);
            fetchTasks();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this task?')) return;
        try { await api.delete(`/tasks/${id}`); toast.success('Deleted'); fetchTasks(); }
        catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try { await api.put(`/tasks/${id}`, { status: newStatus === 'todo' ? 'pending' : newStatus }); toast.success('Status updated'); fetchTasks(); }
        catch (err: any) { toast.error('Failed to update status'); }
    };

    const openEdit = (t: Task) => {
        setEditTask(t);
        setForm({
            title: t.title,
            description: t.description || '',
            status: t.status,
            priority: t.priority,
            deadline: t.deadline?.split('T')[0] || '',
            project: t.project?._id || '',
            assignedTo: t.assignedTo?._id || t.assignedTo?.id || '',
        });
    };

    const loadTaskCollaboration = async (taskId: string) => {
        setSelectedTaskId(taskId);
        try {
            const [commentsData, attachmentsData] = await Promise.all([
                collaborationService.getTaskComments(taskId),
                collaborationService.getTaskAttachments(taskId),
            ]);
            setComments(commentsData);
            setAttachments(attachmentsData);
        } catch {
            toast.error('Failed to load task collaboration data');
        }
    };

    const handleAddComment = async () => {
        if (!selectedTaskId || !commentInput.trim()) return;
        await collaborationService.addTaskComment(selectedTaskId, commentInput.trim());
        setCommentInput('');
        await loadTaskCollaboration(selectedTaskId);
    };

    const handleUploadAttachment = async (file: File | null) => {
        if (!selectedTaskId || !file) return;
        await collaborationService.uploadTaskAttachment(selectedTaskId, file);
        await loadTaskCollaboration(selectedTaskId);
    };

    const handleDeleteAttachment = async (attachmentId: string) => {
        await collaborationService.deleteAttachment(attachmentId);
        await loadTaskCollaboration(selectedTaskId);
    };

    const filtered = tasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const getStatusColor = (s: string) => ({ completed: '#10b981', overdue: '#dc2626', 'in-progress': '#3b82f6', in_progress: '#3b82f6', pending: '#9ca3af', todo: '#9ca3af', 'not-started': '#9ca3af' }[s?.toLowerCase()] || '#6b7280');
    const getPriorityColor = (p: string) => ({ high: '#dc2626', critical: '#dc2626', medium: '#d97706', low: '#059669' }[p?.toLowerCase()] || '#6b7280');
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' };
    const btnPrimary: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, border: 'none', background: '#0f5841', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Tasks</h1>
                <button onClick={() => { setShowCreate(true); setEditTask(null); }} style={btnPrimary}>
                    <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> New Task
                </button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10, padding: '8px 16px', flex: 1, maxWidth: 400, border: '1px solid #e5e7eb' }}>
                    <Search size={16} color="#9ca3af" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, flex: 1 }} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, background: '#fff' }}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="overdue">Overdue</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {(showCreate || editTask) && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 480 }}>
                        <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
                        <form onSubmit={editTask ? handleUpdate : handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Task title" style={inputStyle} />
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} style={inputStyle}>
                                <option value="">Unassigned</option>
                                {members.map((member) => (
                                    <option key={member._id || member.id} value={member._id || member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                            <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} style={inputStyle} required>
                                <option value="">Select project</option>
                                {projects.map((project) => (
                                    <option key={project._id || project.id} value={project._id || project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={inputStyle} />
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => { setShowCreate(false); setEditTask(null); }} style={{ ...btnPrimary, background: '#f3f4f6', color: '#374151' }}>Cancel</button>
                                <button type="submit" style={btnPrimary}>{editTask ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}><ListTodo size={32} style={{ opacity: 0.4, marginBottom: 8 }} /><p>No tasks found</p></div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                {['Task', 'Project', 'Assignee', 'Status', 'Priority', 'Deadline', 'Actions', 'Collaborate'].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(t => {
                                const taskId = getTaskId(t);
                                const isOverdue = new Date(t.deadline) < new Date() && t.status !== 'completed';
                                return (
                                    <tr key={taskId} style={{ borderBottom: '1px solid #f9fafb', background: isOverdue ? '#fff7f7' : 'transparent' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14, color: '#111827' }}>{t.title}</td>
                                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{t.project?.name || '—'}</td>
                                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{t.assignedTo?.name || 'Unassigned'}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <select value={t.status} onChange={e => handleStatusChange(taskId, e.target.value)}
                                                style={{ padding: '4px 8px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600, color: '#fff', background: getStatusColor(t.status), cursor: 'pointer', textTransform: 'capitalize' }}>
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="overdue">Overdue</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: getPriorityColor(t.priority), textTransform: 'uppercase' }}>{t.priority}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {formatDate(t.deadline)}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => openEdit(t)} style={{ background: '#dbeafe', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }}><Edit2 size={14} color="#2563eb" /></button>
                                                <button onClick={() => handleDelete(taskId)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }}><Trash2 size={14} color="#dc2626" /></button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <button onClick={() => loadTaskCollaboration(taskId)} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>Open</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedTaskId && (
                <div style={{ marginTop: 20, background: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, padding: 16 }}>
                    <h3 style={{ margin: '0 0 12px' }}>Task Collaboration</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Comments</h4>
                            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #f3f4f6', borderRadius: 8, padding: 8 }}>
                                {comments.map(c => (
                                    <div key={c._id} style={{ padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                        <div style={{ fontSize: 12, color: '#6b7280' }}>{c.userId?.name || 'User'} • {new Date(c.createdAt).toLocaleString()}</div>
                                        <div style={{ fontSize: 13 }}>{c.message}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <input value={commentInput} onChange={e => setCommentInput(e.target.value)} placeholder="Add comment..." style={{ ...inputStyle, margin: 0 }} />
                                <button onClick={handleAddComment} style={btnPrimary}>Post</button>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Attachments</h4>
                            <input type="file" onChange={e => handleUploadAttachment(e.target.files?.[0] || null)} />
                            <div style={{ marginTop: 8, maxHeight: 180, overflowY: 'auto' }}>
                                {attachments.map(a => (
                                    <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                        <a href={`${(api.defaults.baseURL || '').replace(/\/api\/?$/, '')}${a.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{a.fileName}</a>
                                        <button onClick={() => handleDeleteAttachment(a._id)} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;

