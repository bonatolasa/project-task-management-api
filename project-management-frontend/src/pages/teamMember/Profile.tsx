import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store/store';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { User, Mail, Shield, Save, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/users/${user?.id}`, { name, email });
            // Update localStorage
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                localStorage.setItem('user', JSON.stringify({ ...parsed, name, email }));
            }
            toast.success('Profile updated!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update');
        } finally { setSaving(false); }
    };

    const handleLogout = () => { dispatch(logout()); navigate('/login'); };

    const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', marginBottom: 20 };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' };

    return (
        <div style={{ maxWidth: 600 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>My Profile</h1>

            {/* Avatar & Info */}
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #334155, #475569)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 28, flexShrink: 0 }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{user?.name}</div>
                    <div style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>{user?.email}</div>
                    <span style={{ display: 'inline-block', marginTop: 8, padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#d1fae5', color: '#059669', textTransform: 'capitalize' }}>
                        {user?.role?.replace('_', ' ')}
                    </span>
                </div>
            </div>

            {/* Edit Form */}
            <div style={cardStyle}>
                <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={18} color="#334155" /> Edit Profile
                </h2>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                    </div>
                    <button type="submit" disabled={saving} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px',
                        borderRadius: 10, border: 'none', background: '#334155', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.6 : 1
                    }}>
                        <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Logout */}
            <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
                borderRadius: 10, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 600, fontSize: 14, cursor: 'pointer'
            }}>
                <LogOut size={16} /> Sign Out
            </button>
        </div>
    );
};

export default Profile;
