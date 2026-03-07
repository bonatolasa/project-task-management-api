import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ManagerSidebar } from './Sidebar';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { Search } from 'lucide-react';
import { NotificationBell } from '../common/NotificationBell';

export const PromanagerLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
            <ManagerSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <div
                style={{
                    flex: 1,
                    marginLeft: collapsed ? 72 : 260,
                    transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
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
                                placeholder="Search projects & tasks..."
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
                        <NotificationBell accentColor="#0f5841" />
                        <Link to="/manager/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #0f5841, #1b7a5c)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 14,
                                }}
                            >
                                {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.name || 'Manager'}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>Manager</div>
                            </div>
                        </Link>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1440, width: '100%' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
