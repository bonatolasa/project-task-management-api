import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { getManagerDashboardStats, getProjectPerformance, getManagerProjects } from '../../services/dashboardService';
import { TrendingUp, BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


const Reports: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [stats, setStats] = useState<any>(null);
    const [barData, setBarData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const userId = user?.id || (user as any)?._id;

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            try {
                // Fetch aggregate manager stats
                const statsRes = await getManagerDashboardStats();
                setStats(statsRes.data || statsRes);

                // Fetch individual project performances for the bar chart
                const projRes = await getManagerProjects(userId);
                const projectsData = projRes.data || projRes;
                const projects = Array.isArray(projectsData) ? projectsData : projectsData?.projects || [];

                const perfs = await Promise.all(projects.filter((p: any) => p._id || p.id).slice(0, 6).map(async (p: any) => {
                    const projectId = p._id || p.id;
                    try {
                        const r = await getProjectPerformance(projectId);
                        const data = r.data || r;
                        return {
                            name: p.name?.slice(0, 14),
                            completed: data.completedTasks || 0,
                            total: data.totalTasks || 0,
                            rate: data.completionRate || 0
                        };
                    }
                    catch { return { name: p.name?.slice(0, 14), completed: 0, total: 0, rate: 0 }; }
                }));
                setBarData(perfs);
            } catch (err) {
                console.error('Error fetching manager reports:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading reports...</div>;

    const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };

    const taskDistributionData = stats ? [
        { name: 'Completed', value: stats.completedTasks, fill: '#10b981' },
        { name: 'Active', value: stats.totalTasks - stats.completedTasks - stats.overdueTasks, fill: '#3b82f6' },
        { name: 'Overdue', value: stats.overdueTasks, fill: '#ef4444' },
    ].filter(d => d.value > 0) : [];

    const projectStatusData = stats ? [
        { name: 'Active', value: stats.activeProjects, fill: '#0f5841' },
        { name: 'Overdue', value: stats.overdueProjects, fill: '#ef4444' },
        { name: 'Completed', value: stats.totalProjects - stats.activeProjects - stats.overdueProjects, fill: '#3b82f6' },
    ].filter(d => d.value > 0) : [];

    return (
        <div style={{ padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>Manager Insights</h1>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Completion Rate', value: `${stats?.taskCompletionRate || 0}%`, icon: TrendingUp, color: '#10b981', bg: '#d1fae5' },
                    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckCircle2, color: '#0f5841', bg: '#e6f4ea' },
                    { label: 'Overdue Tasks', value: stats?.overdueTasks || 0, icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
                    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: BarChart3, color: '#1e40af', bg: '#dbeafe' },
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                {/* Project Task Completion Chart */}
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Project Task Completion</h3>
                    {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={barData} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                                <Bar dataKey="total" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Total Tasks" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>No project data available</div>}
                </div>

                {/* Task Breakdown Pie */}
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Global Task Breakdown</h3>
                    {taskDistributionData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={230}>
                                <PieChart>
                                    <Pie data={taskDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={3} strokeWidth={0}>
                                        {taskDistributionData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
                                {taskDistributionData.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} /> {d.name}: {d.value}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <div style={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>No task data</div>}
                </div>
            </div>

            {/* Project Status Allocation */}
            <div style={{ ...cardStyle, maxWidth: 600 }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Managed Project Status</h3>
                {projectStatusData.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} strokeWidth={0}>
                                    {projectStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 10, border: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
                            {projectStatusData.map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} /> {d.name}: {d.value}
                                </div>
                            ))}
                        </div>
                    </>
                ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>No project data</div>}
            </div>
        </div>
    );
};

export default Reports;
