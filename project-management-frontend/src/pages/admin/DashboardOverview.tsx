import React, { useEffect, useState } from 'react';
import { StatsCards } from '../../Component/admin/StatsCards';
import { QuickActions } from '../../Component/admin/QuickActions';
import { getDashboardStats, getOverdueProjects, getOverdueTasks } from '../../services/dashboardService';
import type { DashboardStats, OverdueProject, OverdueTask } from '../../types/dashboard';
import { AlertTriangle, FolderKanban, Clock, ExternalLink } from 'lucide-react';

const DashboardOverview: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [overdueProjects, setOverdueProjects] = useState<OverdueProject[]>([]);
    const [overdueTasks, setOverdueTasks] = useState<OverdueTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, projectsRes, tasksRes] = await Promise.allSettled([
                    getDashboardStats(),
                    getOverdueProjects(),
                    getOverdueTasks(),
                ]);

                if (statsRes.status === 'fulfilled') {
                    setStats(statsRes.value.data || statsRes.value);
                }
                if (projectsRes.status === 'fulfilled') {
                    const pData = projectsRes.value.data || projectsRes.value;
                    setOverdueProjects(Array.isArray(pData) ? pData : pData?.projects || []);
                }
                if (tasksRes.status === 'fulfilled') {
                    const tData = tasksRes.value.data || tasksRes.value;
                    setOverdueTasks(Array.isArray(tData) ? tData : tData?.tasks || []);
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getPriorityStyle = (priority: string) => {
        const map: Record<string, { bg: string; color: string }> = {
            high: { bg: '#fee2e2', color: '#dc2626' },
            critical: { bg: '#fee2e2', color: '#dc2626' },
            medium: { bg: '#fef3c7', color: '#d97706' },
            low: { bg: '#d1fae5', color: '#059669' },
        };
        return map[priority?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };
    };

    return (
        <div>
            {/* Page Title */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>
                    Dashboard Overview
                </h1>
                <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
                    Monitor your organization's projects, tasks, and team performance
                </p>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 28 }}>
                <QuickActions />
            </div>

            {/* Stats Cards */}
            <div style={{ marginBottom: 32 }}>
                <StatsCards stats={stats} loading={loading} />
            </div>

            {/* Overdue Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24 }}>
                {/* Overdue Projects */}
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: '1px solid #f3f4f6',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '18px 24px',
                            borderBottom: '1px solid #f3f4f6',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: '#fef2f2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <FolderKanban size={18} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
                                Overdue Projects
                            </h3>
                        </div>
                        <span
                            style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                padding: '4px 10px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            {overdueProjects.length}
                        </span>
                    </div>

                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                        ) : overdueProjects.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                                <AlertTriangle size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                                <p style={{ margin: 0, fontSize: 14 }}>No overdue projects 🎉</p>
                            </div>
                        ) : (
                            overdueProjects.map((project) => (
                                <div
                                    key={`project-${project._id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 24px',
                                        borderBottom: '1px solid #f9fafb',
                                        transition: 'background 0.15s',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                                            {project.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Clock size={12} />
                                            Due: {formatDate(project.deadline)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span
                                            style={{
                                                background: '#fee2e2',
                                                color: '#dc2626',
                                                padding: '3px 8px',
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {project.status}
                                        </span>
                                        <ExternalLink size={14} color="#9ca3af" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Overdue Tasks */}
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: '1px solid #f3f4f6',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '18px 24px',
                            borderBottom: '1px solid #f3f4f6',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: '#fff7ed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <AlertTriangle size={18} color="#f59e0b" />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
                                Overdue Tasks
                            </h3>
                        </div>
                        <span
                            style={{
                                background: '#fef3c7',
                                color: '#d97706',
                                padding: '4px 10px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            {overdueTasks.length}
                        </span>
                    </div>

                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                        ) : overdueTasks.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                                <AlertTriangle size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                                <p style={{ margin: 0, fontSize: 14 }}>No overdue tasks 🎉</p>
                            </div>
                        ) : (
                            overdueTasks.map((task) => (
                                <div
                                    key={`task-${task._id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 24px',
                                        borderBottom: '1px solid #f9fafb',
                                        transition: 'background 0.15s',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {task.title}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Clock size={12} /> {formatDate(task.deadline)}
                                            </span>
                                            {task.project?.name && (
                                                <span>• {task.project.name}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                                        <span
                                            style={{
                                                background: getPriorityStyle(task.priority).bg,
                                                color: getPriorityStyle(task.priority).color,
                                                padding: '3px 8px',
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
