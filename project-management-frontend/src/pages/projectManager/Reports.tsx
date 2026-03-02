import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { getManagerProjects, getProjectPerformance, getTeamPerformance } from '../../services/dashboardService';
import { BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const Reports: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [barData, setBarData] = useState<any[]>([]);
    const [teamPerf, setTeamPerf] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        const fetchData = async () => {
            try {
                const projRes = await getManagerProjects(user.id);
                const projects = Array.isArray(projRes.data || projRes) ? (projRes.data || projRes) : (projRes.data || projRes)?.projects || [];
                const perfs = await Promise.all(projects.slice(0, 6).map(async (p: any) => {
                    try { const r = await getProjectPerformance(p._id); return r.data || r; }
                    catch { return { projectName: p.name, totalTasks: 0, completedTasks: 0, completionRate: 0 }; }
                }));
                setBarData(perfs.map(p => ({ name: p.projectName?.slice(0, 14), completed: p.completedTasks, total: p.totalTasks, rate: p.completionRate })));
                try { const t = await getTeamPerformance(user.id); setTeamPerf(t.data || t); } catch { }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user?.id]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

    const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };
    const teamPieData = teamPerf?.taskStatusDistribution?.filter((d: any) => d.count > 0) || [];

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>Reports</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Project Task Completion</h3>
                    {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={barData} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ borderRadius: 10, border: 'none' }} />
                                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                                <Bar dataKey="total" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Total" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>No data</div>}
                </div>

                {teamPerf && (
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={18} color="#0f5841" /> Team: {teamPerf.teamName}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            {[
                                { label: 'Total', value: teamPerf.totalTasks, color: '#3b82f6' },
                                { label: 'Done', value: teamPerf.completedTasks, color: '#10b981' },
                                { label: 'In Progress', value: teamPerf.inProgressTasks, color: '#f59e0b' },
                                { label: 'Overdue', value: teamPerf.overdueTasks, color: '#ef4444' },
                            ].map(m => (
                                <div key={m.label} style={{ textAlign: 'center', padding: 14, borderRadius: 10, background: '#f9fafb' }}>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.label}</div>
                                </div>
                            ))}
                        </div>
                        {teamPieData.length > 0 && (
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={teamPieData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3} strokeWidth={0}>
                                        {teamPieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
