import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UsersRound, FolderKanban } from 'lucide-react';

export const QuickActions: React.FC = () => {
    const navigate = useNavigate();

    const actions = [
        { label: 'Create User', icon: UserPlus, path: '/admin/users', color: '#194f87' },
        { label: 'Create Team', icon: UsersRound, path: '/admin/teams', color: '#0f5841' },
        { label: 'View Projects', icon: FolderKanban, path: '/admin/projects', color: '#7c3aed' },
    ];

    return (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {actions.map((action) => (
                <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 20px',
                        borderRadius: 12,
                        border: '2px solid transparent',
                        background: '#fff',
                        color: action.color,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = action.color;
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = action.color;
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <action.icon size={18} />
                    {action.label}
                </button>
            ))}
        </div>
    );
};
