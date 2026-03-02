import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MemberSidebar } from './Sidebar';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { Bell, Search } from 'lucide-react';

export const TeamMemberLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
            <MemberSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <div
                style={{
                    flex: 1,
                    marginLeft: collapsed ? 72 : 260,
                    transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <header
                    style={{
                        height: 68,
                        background: '#fff',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 32px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 30,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: '#f3f4f6',
                                borderRadius: 10,
                                padding: '8px 16px',
                                width: 320,
                            }}
                        >
                            <Search size={16} color="#9ca3af" />
                            <input
                                placeholder="Search tasks..."
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontSize: 14,
                                    color: '#374151',
                                    width: '100%',
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <button style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8 }}>
                            <Bell size={20} color="#6b7280" />
                            <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #334155, #475569)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 14,
                                }}
                            >
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.name || 'Member'}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>Team Member</div>
                            </div>
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1440, width: '100%' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
