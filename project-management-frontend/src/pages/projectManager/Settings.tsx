import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store/store';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Bell, Globe } from 'lucide-react';
import { setApiBaseUrl, getApiBaseUrl } from '../../services/api';

const SettingsPage: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => { dispatch(logout()); navigate('/login'); };
    const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', marginBottom: 20 };

    // API endpoint selection
    const ENV_LOCAL = import.meta.env.VITE_API_LOCAL || 'http://localhost:3000/api';
    const ENV_DEPLOYED = import.meta.env.VITE_API_DEPLOYED || import.meta.env.VITE_API_URL || '';
    const [selectedMode, setSelectedMode] = React.useState(localStorage.getItem('apiBaseUrl') || 'auto');
    const [, setRefreshCount] = React.useState(0);

    // Sync display URL
    const actingUrl = getApiBaseUrl();

    return (
        <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>Settings</h1>

            {/* Account */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}><Settings size={20} color="#0f5841" /><h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Account</h2></div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, fontSize: 14 }}>
                    <span style={{ color: '#9ca3af' }}>Name</span><span style={{ fontWeight: 600 }}>{user?.name || '—'}</span>
                    <span style={{ color: '#9ca3af' }}>Email</span><span>{user?.email || '—'}</span>
                    <span style={{ color: '#9ca3af' }}>Role</span><span style={{ textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ') || '—'}</span>
                </div>
            </div>

            {/* API Endpoint */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Globe size={20} color="#10b981" />
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>API Endpoint</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <select
                        value={selectedMode}
                        onChange={e => {
                            const val = e.target.value;
                            setSelectedMode(val);
                            setApiBaseUrl(val);
                            setRefreshCount(prev => prev + 1);
                        }}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer' }}
                    >
                        <option value="auto">Automatic (Detection)</option>
                        <option value={ENV_LOCAL}>Local (Manual)</option>
                        {ENV_DEPLOYED && <option value={ENV_DEPLOYED}>Deployed (Manual)</option>}
                    </select>
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                    Acting URL: <code style={{ color: '#10b981', fontWeight: 600 }}>{actingUrl}</code>
                    {selectedMode === 'auto' && ' (Auto-detected)'}
                </p>
            </div>

            {/* Notifications */}
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
