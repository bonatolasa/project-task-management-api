import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import api from '../../services/api';
import { Users, Mail, Crown, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamMember {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface Team {
    _id: string;
    name: string;
    members: TeamMember[];
}

const Team: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await api.get('/teams/my-teams');
                const data = res.data?.data || res.data || [];
                setTeams(Array.isArray(data) ? data : [data]);
            } catch (err: any) {
                console.error('fetchTeams error', err);
                toast.error(err.response?.data?.message || 'Failed to load teams');
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchTeams();
    }, [user]);

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return <Crown size={16} color="#ef4444" />;
            case 'project_manager':
            case 'project manager':
                return <User size={16} color="#f59e0b" />;
            default:
                return <User size={16} color="#6b7280" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return '#fee2e2';
            case 'project_manager':
            case 'project manager':
                return '#fef3c7';
            default:
                return '#f3f4f6';
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                Loading teams...
            </div>
        );
    }

    if (teams.length === 0) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                <Users size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                <p>You are not assigned to any team yet</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>
                    My Teams
                </h1>
                <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
                    You belong to {teams.length} {teams.length === 1 ? 'team' : 'teams'}
                </p>
            </div>

            <div style={{ display: 'grid', gap: 32 }}>
                {teams.map((teamInstance) => (
                    <div key={teamInstance._id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ padding: '6px 12px', background: '#334155', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                                {teamInstance.name}
                            </div>
                            <span style={{ fontSize: 13, color: '#9ca3af' }}>{teamInstance.members?.length || 0} Members</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                            {teamInstance.members?.map((member) => (
                                <div
                                    key={member._id}
                                    style={{
                                        background: '#fff',
                                        borderRadius: 16,
                                        padding: 20,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                        border: '1px solid #f3f4f6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #334155, #475569)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontWeight: 800,
                                            fontSize: 20,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {member.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 16, color: '#111827' }}>
                                            {member.name} {(member._id === user?.id || member._id === (user as any)?._id) && '(You)'}
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                marginTop: 4,
                                            }}
                                        >
                                            <Mail size={14} color="#9ca3af" />
                                            <span style={{ fontSize: 14, color: '#6b7280' }}>
                                                {member.email}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                marginTop: 8,
                                                padding: '4px 10px',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                background: getRoleColor(member.role),
                                                color: member.role === 'admin' ? '#dc2626' : member.role === 'project_manager' ? '#d97706' : '#374151',
                                            }}
                                        >
                                            {getRoleIcon(member.role)}
                                            {member.role?.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Team;