import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { getDashboardStats } from '../../services/dashboardService';
import type { DashboardStats } from '../../types/dashboard';
import { BarChart3, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#194f87', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getDashboardStats();
                setStats(res.data || res);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading reports...</div>;

    const taskData = stats ? [
        { name: 'Completed', value: stats.completedTasks, fill: '#10b981' },
        { name: 'Active', value: stats.totalTasks - stats.completedTasks - stats.overdueTasks, fill: '#3b82f6' },
        { name: 'Overdue', value: stats.overdueTasks, fill: '#ef4444' },
    ] : [];

    const projectData = stats ? [
        { name: 'Active', value: stats.activeProjects, fill: '#194f87' },
        { name: 'Completed', value: stats.totalProjects - stats.activeProjects - stats.overdueProjects, fill: '#10b981' },
        { name: 'Overdue', value: stats.overdueProjects, fill: '#ef4444' },
    ] : [];

    const barData = stats ? [
        { name: 'Projects', total: stats.totalProjects, active: stats.activeProjects, overdue: stats.overdueProjects },
        { name: 'Tasks', total: stats.totalTasks, active: stats.totalTasks - stats.completedTasks, overdue: stats.overdueTasks },
    ] : [];

    const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>Reports & Analytics</h1>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Completion Rate', value: `${stats?.taskCompletionRate || 0}%`, icon: TrendingUp, color: '#10b981', bg: '#d1fae5' },
                    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckCircle2, color: '#194f87', bg: '#e8f0fe' },
                    { label: 'Overdue Tasks', value: stats?.overdueTasks || 0, icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
                    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: BarChart3, color: '#8b5cf6', bg: '#ede9fe' },
                ].map((s) => (
                    <div key={s.label} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon size={20} color={s.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Task Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={taskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} strokeWidth={0}>
                                {taskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        {taskData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} /> {d.name}: {d.value}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Overview Comparison</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="total" fill="#194f87" radius={[4, 4, 0, 0]} name="Total" />
                            <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active" />
                            <Bar dataKey="overdue" fill="#ef4444" radius={[4, 4, 0, 0]} name="Overdue" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Project Breakdown Pie */}
            <div style={{ ...cardStyle, maxWidth: 500 }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Project Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={projectData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} strokeWidth={0}>
                            {projectData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: 'none' }} />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                    {projectData.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} /> {d.name}: {d.value}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;
