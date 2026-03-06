import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import {
    LayoutDashboard,
    ListTodo,
    BarChart3,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    FolderKanban,
} from 'lucide-react';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/dashboard/tasks', icon: ListTodo, label: 'My Tasks' },
    { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/dashboard/progress', icon: BarChart3, label: 'Progress' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

export const MemberSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
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
                background: 'linear-gradient(180deg, #1e293b 0%, #334155 60%, #475569 100%)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 40,
                boxShadow: '4px 0 24px rgba(30,41,59,0.2)',
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
