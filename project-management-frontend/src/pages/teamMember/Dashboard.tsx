import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { getMyTasks, getDueSoonTasks, getOverdueTasks, getUserPerformance } from '../../services/dashboardService';
import type { MyTask, UserPerformance } from '../../types/dashboard';
import {
    ListTodo,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Target,
    Zap,
    User,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();
    const [myTasks, setMyTasks] = useState<MyTask[]>([]);
    const [dueSoon, setDueSoon] = useState<MyTask[]>([]);
    const [overdue, setOverdue] = useState<MyTask[]>([]);
    const [performance, setPerformance] = useState<UserPerformance | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const [tasksRes, dueRes, overdueRes, perfRes] = await Promise.allSettled([
                    getMyTasks(),
                    getDueSoonTasks(3),
                    getOverdueTasks(),
                    getUserPerformance(user.id),
                ]);

                if (tasksRes.status === 'fulfilled') {
                    const d = tasksRes.value.data || tasksRes.value;
                    setMyTasks(Array.isArray(d) ? d.slice(0, 5) : d?.tasks?.slice(0, 5) || []);
                }
                if (dueRes.status === 'fulfilled') {
                    const d = dueRes.value.data || dueRes.value;
                    setDueSoon(Array.isArray(d) ? d : d?.tasks || []);
                }
                if (overdueRes.status === 'fulfilled') {
                    const d = overdueRes.value.data || overdueRes.value;
                    setOverdue(Array.isArray(d) ? d : d?.tasks || []);
                }
                if (perfRes.status === 'fulfilled') {
                    setPerformance(perfRes.value.data || perfRes.value);
                }
            } catch (err) {
                console.error('Member dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const getPriorityStyle = (priority: string) => {
        const map: Record<string, { bg: string; color: string }> = {
            high: { bg: '#fee2e2', color: '#dc2626' },
            critical: { bg: '#fee2e2', color: '#dc2626' },
            medium: { bg: '#fef3c7', color: '#d97706' },
            low: { bg: '#d1fae5', color: '#059669' },
        };
        return map[priority?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };
    };

    const getStatusStyle = (status: string) => {
        const map: Record<string, { bg: string; color: string }> = {
            completed: { bg: '#d1fae5', color: '#059669' },
            'in-progress': { bg: '#dbeafe', color: '#2563eb' },
            'in_progress': { bg: '#dbeafe', color: '#2563eb' },
            todo: { bg: '#f3f4f6', color: '#6b7280' },
            'not-started': { bg: '#f3f4f6', color: '#6b7280' },
        };
        return map[status?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };
    };

    const pieData = performance
        ? [
            { name: 'Completed', value: performance.completedTasks },
            { name: 'In Progress', value: performance.inProgressTasks },
            { name: 'Remaining', value: Math.max(0, performance.totalTasks - performance.completedTasks - performance.inProgressTasks - performance.overdueTasks) },
            { name: 'Overdue', value: performance.overdueTasks },
        ].filter((d) => d.value > 0)
        : [];

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            border: '4px solid #e5e7eb',
                            borderTopColor: '#334155',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto 16px',
                        }}
                    />
                    <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading your workspace...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'} 👋
                    </h1>
                    <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
                        Here's your task overview for today
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => navigate('/dashboard/tasks')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 18px',
                            borderRadius: 10,
                            border: 'none',
                            background: '#334155',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                        }}
                    >
                        <ListTodo size={16} /> All Tasks
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/profile')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 18px',
                            borderRadius: 10,
                            border: '2px solid #334155',
                            background: 'transparent',
                            color: '#334155',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                        }}
                    >
                        <User size={16} /> Profile
                    </button>
                </div>
            </div>

            {/* Mini Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total Tasks', value: performance?.totalTasks || myTasks.length, icon: Target, color: '#3b82f6', bg: '#dbeafe' },
                    { label: 'Completed', value: performance?.completedTasks || 0, icon: CheckCircle2, color: '#10b981', bg: '#d1fae5' },
                    { label: 'Due Soon', value: dueSoon.length, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
                    { label: 'Overdue', value: overdue.length, icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
                ].map((s) => (
                    <div
                        key={s.label}
                        style={{
                            background: '#fff',
                            borderRadius: 14,
                            padding: '20px 22px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            border: '1px solid #f3f4f6',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon size={20} color={s.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 2 }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, marginBottom: 24 }}>
                {/* My Tasks */}
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: '1px solid #f3f4f6',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Zap size={18} color="#f59e0b" />
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>My Tasks</h3>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/tasks')}
                            style={{ background: 'none', border: 'none', color: '#334155', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div>
                        {myTasks.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                                <ListTodo size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                                <p style={{ margin: 0, fontSize: 14 }}>No tasks assigned yet</p>
                            </div>
                        ) : (
                            myTasks.map((task) => (
                                <div
                                    key={task._id}
                                    style={{
                                        padding: '16px 24px',
                                        borderBottom: '1px solid #f9fafb',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{task.title}</span>
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
                                            <span
                                                style={{
                                                    background: getStatusStyle(task.status).bg,
                                                    color: getStatusStyle(task.status).color,
                                                    padding: '2px 8px',
                                                    borderRadius: 6,
                                                    fontSize: 10,
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {task.status?.replace(/[-_]/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {task.progress !== undefined && (
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                                                    <div style={{ width: `${task.progress}%`, height: '100%', borderRadius: 3, background: '#334155', transition: 'width 0.5s' }} />
                                                </div>
                                                <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{task.progress}%</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, display: 'flex', gap: 12 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={12} /> {formatDate(task.deadline)}
                                        </span>
                                        {task.project?.name && <span>• {task.project.name}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Progress Overview */}
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: 24,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: '1px solid #f3f4f6',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#111827' }}>My Progress</h3>

                    {/* Completion rate big number */}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 48, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                            {performance?.completionRate || 0}%
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Task Completion</div>
                    </div>

                    {/* Pie Chart */}
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={65}
                                    innerRadius={35}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>
                            No data yet
                        </div>
                    )}

                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                        {pieData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                                    {d.name}
                                </div>
                                <span style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom row: Due Soon + Overdue */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Due Soon */}
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: '1px solid #f3f4f6',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={16} color="#f59e0b" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Due Soon (3 days)</h3>
                        </div>
                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                            {dueSoon.length}
                        </span>
                    </div>
                    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                        {dueSoon.length === 0 ? (
                            <div style={{ padding: 36, textAlign: 'center', color: '#9ca3af' }}>
                                <CheckCircle2 size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                                <p style={{ margin: 0, fontSize: 14 }}>All caught up! 🎉</p>
                            </div>
                        ) : (
                            dueSoon.map((task) => (
                                <div
                                    key={task._id}
                                    style={{
                                        padding: '12px 24px',
                                        borderBottom: '1px solid #f9fafb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'background 0.15s',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fffbeb')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{task.title}</div>
                                        <div style={{ fontSize: 12, color: '#d97706', marginTop: 2 }}>
                                            <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                            {formatDate(task.deadline)}
                                        </div>
                                    </div>
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
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Overdue */}
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: '1px solid #f3f4f6',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={16} color="#ef4444" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Overdue Tasks</h3>
                        </div>
                        <span style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                            {overdue.length}
                        </span>
                    </div>
                    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                        {overdue.length === 0 ? (
                            <div style={{ padding: 36, textAlign: 'center', color: '#9ca3af' }}>
                                <CheckCircle2 size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                                <p style={{ margin: 0, fontSize: 14 }}>No overdue tasks! 🎉</p>
                            </div>
                        ) : (
                            overdue.map((task) => (
                                <div
                                    key={task._id}
                                    style={{
                                        padding: '12px 24px',
                                        borderBottom: '1px solid #f9fafb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'background 0.15s',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{task.title}</div>
                                        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>
                                            <AlertTriangle size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                            Was due {formatDate(task.deadline)}
                                        </div>
                                    </div>
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
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
