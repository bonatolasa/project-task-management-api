import React, { useEffect, useState } from 'react';
import { getMyTasks } from '../../services/dashboardService';
import api from '../../services/api';
import { Search, ListTodo, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

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

const Tasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchTasks = async () => {
        try {
            const res = await getMyTasks();
            const data = res.data || res;
            setTasks(Array.isArray(data) ? data : data?.tasks || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.put(`/tasks/${id}`, { status: newStatus });
            toast.success('Status updated!');
            fetchTasks();
        } catch { toast.error('Failed to update'); }
    };

    const handleProgressChange = async (id: string, percentageComplete: number) => {
        try {
            await api.patch(`/tasks/${id}/progress`, { percentageComplete });
            toast.success('Progress updated!');
            setTasks((prev) =>
                prev.map((task) =>
                    task._id === id
                        ? { ...task, percentageComplete, progress: percentageComplete }
                        : task,
                ),
            );
        } catch {
            toast.error('Failed to update progress');
        }
    };

    const filtered = tasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const getStatusColor = (s: string) => ({ completed: '#10b981', 'in-progress': '#3b82f6', 'in_progress': '#3b82f6', todo: '#9ca3af', 'not-started': '#9ca3af' }[s?.toLowerCase()] || '#6b7280');
    const getPriorityStyle = (p: string) => {
        const m: Record<string, { bg: string; color: string }> = { high: { bg: '#fee2e2', color: '#dc2626' }, critical: { bg: '#fee2e2', color: '#dc2626' }, medium: { bg: '#fef3c7', color: '#d97706' }, low: { bg: '#d1fae5', color: '#059669' } };
        return m[p?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };
    };
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>My Tasks</h1>
                <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>{tasks.length} tasks assigned to you</p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10, padding: '8px 16px', flex: 1, maxWidth: 400, border: '1px solid #e5e7eb' }}>
                    <Search size={16} color="#9ca3af" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, flex: 1 }} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, background: '#fff' }}>
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading tasks...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', background: '#fff', borderRadius: 16 }}>
                        <ListTodo size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                        <p>No tasks found</p>
                    </div>
                ) : (
                    filtered.map(t => {
                        const isOverdue = new Date(t.deadline) < new Date() && t.status !== 'completed';
                        return (
                            <div key={t._id} style={{
                                background: '#fff', borderRadius: 14, padding: '18px 24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${isOverdue ? '#fecaca' : '#f3f4f6'}`,
                                transition: 'transform 0.15s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <button onClick={() => handleStatusChange(t._id, t.status === 'completed' ? 'pending' : 'completed')}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                            <CheckCircle2 size={20} color={t.status === 'completed' ? '#10b981' : '#d1d5db'} fill={t.status === 'completed' ? '#d1fae5' : 'none'} />
                                        </button>
                                        <span style={{ fontWeight: 600, fontSize: 15, color: '#111827', textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>{t.title}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <span style={{ background: getPriorityStyle(t.priority).bg, color: getPriorityStyle(t.priority).color, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{t.priority}</span>
                                        <select value={t.status} onChange={e => handleStatusChange(t._id, e.target.value)}
                                            style={{ padding: '2px 8px', borderRadius: 6, border: 'none', fontSize: 10, fontWeight: 600, color: '#fff', background: getStatusColor(t.status), cursor: 'pointer' }}>
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                                {(t.percentageComplete !== undefined || t.progress !== undefined) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                                            <div style={{ width: `${t.percentageComplete ?? t.progress ?? 0}%`, height: '100%', borderRadius: 3, background: '#334155' }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{t.percentageComplete ?? t.progress ?? 0}%</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={t.percentageComplete ?? t.progress ?? 0}
                                            onChange={(e) => handleProgressChange(t._id, Number(e.target.value))}
                                        />
                                    </div>
                                )}
                                <div style={{ fontSize: 12, color: isOverdue ? '#ef4444' : '#9ca3af', display: 'flex', gap: 12 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {formatDate(t.deadline)}</span>
                                    {t.project?.name && <span>• {t.project.name}</span>}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Tasks;
