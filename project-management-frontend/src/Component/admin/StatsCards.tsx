import React from 'react';
import {
    FolderKanban,
    ListTodo,
    Users,
    UsersRound,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    Clock,
} from 'lucide-react';
import type { DashboardStats } from '../../types/dashboard';

interface StatsCardsProps {
    stats: DashboardStats | null;
    loading: boolean;
}

interface StatCardData {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    bgLight: string;
    suffix?: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            background: '#fff',
                            borderRadius: 16,
                            padding: 24,
                            height: 120,
                            animation: 'pulse 1.5s ease-in-out infinite',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        }}
                    />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const cards: StatCardData[] = [
        { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: '#194f87', bgLight: '#e8f0fe' },
        { label: 'Active Projects', value: stats.activeProjects, icon: TrendingUp, color: '#0f5841', bgLight: '#e6f7f0' },
        { label: 'Total Tasks', value: stats.totalTasks, icon: ListTodo, color: '#7c3aed', bgLight: '#f3e8ff' },
        { label: 'Completed Tasks', value: stats.completedTasks, icon: CheckCircle2, color: '#10b981', bgLight: '#d1fae5' },
        { label: 'Overdue Tasks', value: stats.overdueTasks, icon: AlertTriangle, color: '#ef4444', bgLight: '#fee2e2' },
        { label: 'Users', value: stats.totalUsers, icon: Users, color: '#f59e0b', bgLight: '#fef3c7' },
        { label: 'Teams', value: stats.totalTeams, icon: UsersRound, color: '#06b6d4', bgLight: '#cffafe' },
        { label: 'Completion Rate', value: `${stats.taskCompletionRate}%`, icon: Clock, color: '#8b5cf6', bgLight: '#ede9fe', suffix: '' },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {cards.map((card) => (
                <div
                    key={card.label}
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: '22px 24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'default',
                        border: '1px solid #f3f4f6',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: card.bgLight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <card.icon size={22} color={card.color} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {card.label}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
                            {card.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
