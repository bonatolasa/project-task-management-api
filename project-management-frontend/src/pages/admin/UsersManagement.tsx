import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
    isActive?: boolean;
}

const UsersManagement: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showCreate, setShowCreate] = useState(false);
    const [editUser, setEditUser] = useState<UserData | null>(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            const responseData = res.data;
            let usersData = responseData.data || responseData.users || responseData;
            if (!Array.isArray(usersData)) usersData = [];

            // Normalize: ensure each user has an _id (if backend returns 'id', copy it)
            const normalized = usersData.map((user: any) => ({
                ...user,
                _id: user._id || user.id,
            }));
            setUsers(normalized);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users', form);
            toast.success('User created!');
            setShowCreate(false);
            setForm({ name: '', email: '', password: '', role: 'member' });
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) {
            toast.error('No user selected for update');
            return;
        }
        const userId = editUser._id;
        if (!userId) {
            toast.error('User ID is missing – cannot update');
            return;
        }
        try {
            const { password, ...rest } = form;
            const payload = password ? form : rest;
            // Use PATCH instead of PUT
            await api.patch(`/users/${userId}`, payload);
            toast.success('User updated!');
            setEditUser(null);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDelete = async (id: string) => {
        if (!id) {
            toast.error('Invalid user ID');
            return;
        }
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const openEdit = (user: UserData) => {
        if (!user._id) {
            toast.error('Cannot edit user: missing ID');
            return;
        }
        setEditUser(user);
        setForm({ name: user.name, email: user.email, password: '', role: user.role });
    };

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const getRoleStyle = (role: string) => {
        const m: Record<string, { bg: string; color: string }> = {
            admin: { bg: '#fee2e2', color: '#dc2626' },
            manager: { bg: '#dbeafe', color: '#2563eb' },
            member: { bg: '#d1fae5', color: '#059669' },
        };
        return m[role] || { bg: '#f3f4f6', color: '#6b7280' };
    };

    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' };
    const btnPrimary: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, border: 'none', background: '#194f87', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Users</h1>
                    <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>{users.length} total users</p>
                </div>
                <button onClick={() => { setShowCreate(true); setEditUser(null); setForm({ name: '', email: '', password: '', role: 'member' }); }} style={btnPrimary}>
                    <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Add User
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10, padding: '8px 16px', flex: 1, maxWidth: 400, border: '1px solid #e5e7eb' }}>
                    <Search size={16} color="#9ca3af" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, flex: 1 }} />
                </div>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, background: '#fff', cursor: 'pointer' }}>
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>  {/* Changed from project_manager */}
                    <option value="member">Member</option>
                </select>
            </div>

            {/* Modal */}
            {(showCreate || editUser) && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 480 }}>
                        <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>{editUser ? 'Edit User' : 'Add User'}</h2>
                        <form onSubmit={editUser ? handleUpdate : handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Password {editUser && '(leave blank to keep)'}</label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editUser} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                                    <option value="member">Member</option>
                                    <option value="manager">Manager</option>  {/* Changed from project_manager */}
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                                <button type="button" onClick={() => { setShowCreate(false); setEditUser(null); }} style={{ ...btnPrimary, background: '#f3f4f6', color: '#374151' }}>Cancel</button>
                                <button type="submit" style={btnPrimary}>{editUser ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}><Users size={32} style={{ opacity: 0.4, marginBottom: 8 }} /><p>No users found</p></div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                {['User', 'Email', 'Role', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u._id} style={{ borderBottom: '1px solid #f9fafb' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #194f87, #2a6fb0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280' }}>{u.email}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span style={{ background: getRoleStyle(u.role).bg, color: getRoleStyle(u.role).color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                                            {u.role === 'manager' ? 'Manager' : u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => openEdit(u)} style={{ background: '#dbeafe', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }}><Edit2 size={14} color="#2563eb" /></button>
                                            <button onClick={() => handleDelete(u._id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }}><Trash2 size={14} color="#dc2626" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UsersManagement;