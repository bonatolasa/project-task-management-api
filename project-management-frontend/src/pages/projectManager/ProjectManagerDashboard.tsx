import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import {
    getManagerProjects,
    getTeamPerformance,
    getDueSoonTasks,
    getProjectPerformance,
} from '../../services/dashboardService';
import type { Project, TeamPerformance, MyTask, ProjectPerformance } from '../../types/dashboard';
import {
    FolderKanban,
    Clock,
    AlertTriangle,
    TrendingUp,
    Plus,
    ListTodo,
    CheckCircle2,
    Users,
    ArrowRight,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const ProjectManagerDashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const userAny = user as unknown as { id?: string; _id?: string; team?: string; teamId?: string } | null;
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [teamPerf, setTeamPerf] = useState<TeamPerformance | null>(null);
    const [dueSoon, setDueSoon] = useState<MyTask[]>([]);
    const [projectPerfs, setProjectPerfs] = useState<ProjectPerformance[]>([]);
    const [loading, setLoading] = useState(true);

    const userId = userAny?.id || userAny?._id;

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            try {
                const [projRes, dueRes] = await Promise.allSettled([
                    getManagerProjects(userId),
                    getDueSoonTasks(7),
                ]);

                let fetchedProjects: Project[] = [];
                if (projRes.status === 'fulfilled') {
                    const pData = projRes.value.data || projRes.value;
                    fetchedProjects = Array.isArray(pData) ? pData : pData?.projects || [];
                    setProjects(fetchedProjects);
                }
                if (dueRes.status === 'fulfilled') {
                    const dData = dueRes.value.data || dueRes.value;
                    setDueSoon(Array.isArray(dData) ? dData.slice(0, 8) : dData?.tasks?.slice(0, 8) || []);
                }

                // Fetch team performance if user has a team
                const teamId = userAny?.team || userAny?.teamId;
                if (teamId) {
                    try {
                        const teamRes = await getTeamPerformance(teamId);
                        const tData = teamRes.data || teamRes;
                        setTeamPerf(tData);
                    } catch {
                        // team performance may not be available
                    }
                }

                // Fetch per-project performance – only for projects with a valid ID
                const validProjects = fetchedProjects.filter((p) => {
                    const project = p as Project & { id?: string };
                    return Boolean(project._id || project.id);
                });
                const perfPromises = validProjects.slice(0, 5).map(async (p) => {
                    const project = p as Project & { id?: string };
                    const projectId = project._id || project.id;
                    if (!projectId) {
                        return { projectName: p.name, totalTasks: 0, completedTasks: 0, overdueTasks: 0, completionRate: 0 };
                    }
                    try {
                        const res = await getProjectPerformance(projectId);
                        return res.data || res;
                    } catch {
                        return { projectName: p.name, totalTasks: 0, completedTasks: 0, overdueTasks: 0, completionRate: 0 };
                    }
                });
                const perfs = await Promise.all(perfPromises);
                setProjectPerfs(perfs);
            } catch (err) {
                console.error('Manager dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, userAny?.team, userAny?.teamId]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            completed: '#10b981',
            'in-progress': '#3b82f6',
            in_progress: '#3b82f6',
            active: '#3b82f6',
            'not-started': '#9ca3af',
            planning: '#8b5cf6',
            'on-hold': '#f59e0b',
        };
        return map[status?.toLowerCase()] || '#6b7280';
    };

    const getPriorityColor = (priority: string) => {
        const map: Record<string, { bg: string; color: string }> = {
            high: { bg: '#fee2e2', color: '#dc2626' },
            critical: { bg: '#fee2e2', color: '#dc2626' },
            medium: { bg: '#fef3c7', color: '#d97706' },
            low: { bg: '#d1fae5', color: '#059669' },
        };
        return map[priority?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };
    };

    // Aggregated task breakdown for pie chart
    const taskBreakdown = teamPerf?.taskStatusDistribution || [
        { status: 'Completed', count: projects.reduce((s, p) => s + (p.progress || 0), 0) },
        { status: 'In Progress', count: projects.filter((p) => p.status === 'in-progress' || p.status === 'active').length },
        { status: 'Overdue', count: dueSoon.filter((t) => new Date(t.deadline) < new Date()).length },
    ];

    // Bar chart data from project performances
    const barData = projectPerfs.map((p) => ({
        name: p.projectName?.length > 12 ? p.projectName.slice(0, 12) + '...' : p.projectName,
        completed: p.completedTasks,
        total: p.totalTasks,
        rate: p.completionRate,
    }));

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            border: '4px solid #e5e7eb',
                            borderTopColor: '#0f5841',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto 16px',
                        }}
                    />
                    <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading dashboard...</p>
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
                        Welcome back, {user?.name?.split(' ')[0] || 'Manager'} 👋
                    </h1>
                    <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
                        Here's what's happening across your projects today
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => navigate('/manager/projects')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 18px',
                            borderRadius: 10,
                            border: 'none',
                            background: '#0f5841',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Plus size={16} /> New Project
                    </button>
                    <button
                        onClick={() => navigate('/manager/tasks')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 18px',
                            borderRadius: 10,
                            border: '2px solid #0f5841',
                            background: 'transparent',
                            color: '#0f5841',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Plus size={16} /> New Task
                    </button>
                </div>
            </div>

            {/* Mini Stats – add key */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'My Projects', value: projects.length, icon: FolderKanban, color: '#0f5841', bg: '#e6f7f0' },
                    { label: 'Due Soon', value: dueSoon.length, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
                    { label: 'Team Tasks', value: teamPerf?.totalTasks || 0, icon: ListTodo, color: '#3b82f6', bg: '#dbeafe' },
                    { label: 'Completion', value: `${teamPerf?.completionRate || 0}%`, icon: CheckCircle2, color: '#10b981', bg: '#d1fae5' },
                ].map((s, index) => (
                    <div
                        key={index} // unique key added
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

            {/* ... rest of the JSX (unchanged) ... */}
            {/* Projects + Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 24 }}>
                {/* Project Cards */}
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
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>My Projects</h3>
                        <button
                            onClick={() => navigate('/manager/projects')}
                            style={{ background: 'none', border: 'none', color: '#0f5841', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {projects.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                                <FolderKanban size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                                <p style={{ margin: 0 }}>No projects assigned yet</p>
                            </div>
                        ) : (
                            projects.slice(0, 6).map((project) => {
                                const projectItem = project as Project & { id?: string };
                                const projectId = projectItem._id || projectItem.id || project.name;
                                return (
                                    <div
                                        key={projectId}
                                        style={{
                                            padding: '16px 24px',
                                            borderBottom: '1px solid #f9fafb',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{project.name}</span>
                                            <span
                                                style={{
                                                    padding: '3px 10px',
                                                    borderRadius: 20,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    color: '#fff',
                                                    background: getStatusColor(project.status),
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {project.status?.replace(/[-_]/g, ' ')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        width: `${project.progress || 0}%`,
                                                        height: '100%',
                                                        borderRadius: 3,
                                                        background: `linear-gradient(90deg, #0f5841, #1b7a5c)`,
                                                        transition: 'width 0.5s',
                                                    }}
                                                />
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#0f5841' }}>{project.progress || 0}%</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', gap: 12 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Clock size={12} /> {formatDate(project.deadline)}
                                            </span>
                                            {project.team?.name && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Users size={12} /> {project.team.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right column: Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Task Distribution Pie */}
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 16,
                            padding: 24,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            border: '1px solid #f3f4f6',
                        }}
                    >
                        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Task Distribution</h3>
                        {taskBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={taskBreakdown}
                                        dataKey="count"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={70}
                                        innerRadius={40}
                                        paddingAngle={3}
                                        strokeWidth={0}
                                    >
                                        {taskBreakdown.map((_, index) => (
                                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No data</div>
                        )}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                            {taskBreakdown.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                    {item.status}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team Performance */}
                    {teamPerf && (
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 16,
                                padding: 24,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                border: '1px solid #f3f4f6',
                            }}
                        >
                            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <TrendingUp size={16} color="#0f5841" />
                                    Team: {teamPerf.teamName}
                                </span>
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    { label: 'Total', value: teamPerf.totalTasks, color: '#3b82f6' },
                                    { label: 'Done', value: teamPerf.completedTasks, color: '#10b981' },
                                    { label: 'In Progress', value: teamPerf.inProgressTasks, color: '#f59e0b' },
                                    { label: 'Overdue', value: teamPerf.overdueTasks, color: '#ef4444' },
                                ].map((m, idx) => (
                                    <div key={idx} style={{ textAlign: 'center', padding: 10, borderRadius: 10, background: '#f9fafb' }}>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{m.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom row: Project Performance Bar Chart + Due Soon */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Bar Chart */}
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: 24,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: '1px solid #f3f4f6',
                    }}
                >
                    <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#111827' }}>
                        Project Task Completion
                    </h3>
                    {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={barData} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                                <Bar dataKey="total" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Total" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                            No project data yet
                        </div>
                    )}
                </div>

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
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Clock size={18} color="#f59e0b" />
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Upcoming Deadlines (7 days)</h3>
                    </div>
                    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                        {dueSoon.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                                <Clock size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                                <p style={{ margin: 0, fontSize: 14 }}>No upcoming deadlines</p>
                            </div>
                        ) : (
                            dueSoon.map((task, index) => {
                                const isOverdue = new Date(task.deadline) < new Date();
                                return (
                                    <div
                                        key={task._id || `due-${index}`}
                                        style={{
                                            padding: '14px 24px',
                                            borderBottom: '1px solid #f9fafb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'background 0.15s',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {task.title}
                                            </div>
                                            <div style={{ fontSize: 12, color: isOverdue ? '#ef4444' : '#9ca3af', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {isOverdue && <AlertTriangle size={12} />}
                                                {formatDate(task.deadline)}
                                                {task.project?.name && <span> • {task.project.name}</span>}
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                background: getPriorityColor(task.priority).bg,
                                                color: getPriorityColor(task.priority).color,
                                                padding: '3px 8px',
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectManagerDashboard;
