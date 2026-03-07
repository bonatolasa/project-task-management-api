import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import {
    LayoutDashboard,
    FolderKanban,
    ListTodo,
    BarChart3,
    Activity,
    Settings,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const navItems = [
    { to: '/manager', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/manager/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/manager/tasks', icon: ListTodo, label: 'Tasks' },
    { to: '/manager/reports', icon: BarChart3, label: 'Reports' },
    { to: '/manager/activities', icon: Activity, label: 'Activities' },
    { to: '/manager/settings', icon: Settings, label: 'Settings' },
    { to: '/manager/profile', icon: User, label: 'Profile' },
];

export const ManagerSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <aside
            style={{
                width: collapsed ? 72 : 260,
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #0a3f2f 0%, #0f5841 50%, #1b7a5c 100%)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 40,
                boxShadow: '4px 0 24px rgba(15,88,65,0.18)',
            }}
        >
            <div
                style={{
                    padding: collapsed ? '24px 16px' : '24px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <LayoutDashboard size={22} color="#fff" />
                </div>
                {!collapsed && (
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
                        TaskFlow
                    </span>
                )}
            </div>

            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            borderRadius: 10,
                            textDecoration: 'none',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                            background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: 14,
                            transition: 'all 0.2s',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                        })}
                    >
                        <item.icon size={20} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'rgba(239,68,68,0.12)',
                        color: '#fca5a5',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: 14,
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                >
                    <LogOut size={20} />
                    {!collapsed && <span>Logout</span>}
                </button>
                <button
                    onClick={onToggle}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 8,
                        padding: 8,
                        borderRadius: 8,
                        border: 'none',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.2s',
                    }}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </aside>
    );
};
