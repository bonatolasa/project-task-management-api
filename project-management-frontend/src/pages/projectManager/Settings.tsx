import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store/store';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Bell } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => { dispatch(logout()); navigate('/login'); };
    const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', marginBottom: 20 };

    return (
        <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>Settings</h1>
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}><Settings size={20} color="#0f5841" /><h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Account</h2></div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, fontSize: 14 }}>
                    <span style={{ color: '#9ca3af' }}>Name</span><span style={{ fontWeight: 600 }}>{user?.name || '—'}</span>
                    <span style={{ color: '#9ca3af' }}>Email</span><span>{user?.email || '—'}</span>
                    <span style={{ color: '#9ca3af' }}>Role</span><span style={{ textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ') || '—'}</span>
                </div>
            </div>
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}><Bell size={20} color="#f59e0b" /><h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Notifications</h2></div>
                {['Email notifications', 'Task reminders', 'Project updates'].map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, cursor: 'pointer' }}>
                        <span style={{ fontSize: 14 }}>{item}</span>
                        <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: '#0f5841' }} />
                    </label>
                ))}
            </div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                <LogOut size={16} /> Sign Out
            </button>
        </div>
    );
};

export default SettingsPage;
