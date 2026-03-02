import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { getUserPerformance } from '../../services/dashboardService';
import type { UserPerformance } from '../../types/dashboard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Target } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const Progress: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [perf, setPerf] = useState<UserPerformance | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        getUserPerformance(user.id).then(res => { setPerf(res.data || res); setLoading(false); }).catch(() => setLoading(false));
    }, [user?.id]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading progress...</div>;

    const pieData = perf ? [
        { name: 'Completed', value: perf.completedTasks },
        { name: 'In Progress', value: perf.inProgressTasks },
        { name: 'To Do', value: Math.max(0, perf.totalTasks - perf.completedTasks - perf.inProgressTasks - perf.overdueTasks) },
        { name: 'Overdue', value: perf.overdueTasks },
    ].filter(d => d.value > 0) : [];

    const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>My Progress</h1>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total Tasks', value: perf?.totalTasks || 0, icon: Target, color: '#3b82f6', bg: '#dbeafe' },
                    { label: 'Completed', value: perf?.completedTasks || 0, icon: CheckCircle2, color: '#10b981', bg: '#d1fae5' },
                    { label: 'In Progress', value: perf?.inProgressTasks || 0, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
                    { label: 'Overdue', value: perf?.overdueTasks || 0, icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
                ].map(s => (
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Big Rate */}
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                    <TrendingUp size={28} color="#10b981" style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: 56, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{perf?.completionRate || 0}%</div>
                    <div style={{ fontSize: 15, color: '#9ca3af', marginTop: 8 }}>Overall Completion Rate</div>
                    <div style={{ width: '100%', height: 8, borderRadius: 4, background: '#f3f4f6', marginTop: 16, overflow: 'hidden' }}>
                        <div style={{ width: `${perf?.completionRate || 0}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #10b981, #059669)', transition: 'width 1s' }} />
                    </div>
                </div>

                {/* Pie */}
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Task Breakdown</h3>
                    {pieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} strokeWidth={0}>
                                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                                {pieData.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i] }} /> {d.name}
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: 13 }}>{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>No data</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Progress;
