import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Search, Edit2, Trash2, UsersRound, Users, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface Team {
    _id: string;
    name: string;
    description?: string;
    members?: { _id: string; name: string; email: string }[];
    manager?: { _id: string; name: string };
    createdAt?: string;
}

const TeamsManagement: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [editTeam, setEditTeam] = useState<Team | null>(null);
    const [form, setForm] = useState({
        name: '',
        description: '',
        manager: '',
        members: [] as string[]
    });

    const extractArray = (responseData: any): any[] => {
        if (responseData.data && Array.isArray(responseData.data)) return responseData.data;
        if (responseData.users && Array.isArray(responseData.users)) return responseData.users;
        if (responseData.teams && Array.isArray(responseData.teams)) return responseData.teams;
        if (Array.isArray(responseData)) return responseData;
        return [];
    };

    const fetchData = async () => {
        try {
            const [teamsRes, usersRes] = await Promise.all([
                api.get('/teams'),
                api.get('/users')
            ]);

            const teamsArray = extractArray(teamsRes.data);
            const normalizedTeams = teamsArray.map((t: any) => ({
                ...t,
                _id: t._id || t.id,
                manager: t.manager ? { _id: t.manager._id || t.manager.id, name: t.manager.name } : undefined
            }));
            setTeams(normalizedTeams);

            const usersArray = extractArray(usersRes.data);
            const normalizedUsers = usersArray.map((u: any) => ({
                ...u,
                _id: u._id || u.id
            }));
            setAllUsers(normalizedUsers);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/teams/create', form);
            toast.success('Team created!');
            setShowCreate(false);
            setForm({ name: '', description: '', manager: '', members: [] });
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create team');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTeam?._id) {
            toast.error('Team ID missing');
            return;
        }
        try {
            await api.patch(`/teams/${editTeam._id}`, form);
            toast.success('Team updated!');
            setEditTeam(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update team');
        }
    };

    const handleDelete = async (id: string) => {
        if (!id) return;
        if (!window.confirm('Delete this team?')) return;
        try {
            await api.delete(`/teams/${id}`);
            toast.success('Team deleted');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const openEdit = (team: Team) => {
        setEditTeam(team);
        setForm({
            name: team.name,
            description: team.description || '',
            manager: team.manager?._id || '',
            members: team.members?.map(m => m._id) || []
        });
    };

    // Filter users for manager dropdown: only 'manager' role
    const eligibleManagers = allUsers.filter(u => u.role === 'manager');
    // Filter users for member checkboxes: only 'member' role
    const eligibleMembers = allUsers.filter(u => u.role === 'member');

    const filtered = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        fontSize: 14,
        outline: 'none'
    };
    const btnPrimary: React.CSSProperties = {
        padding: '10px 20px',
        borderRadius: 10,
        border: 'none',
        background: '#194f87',
        color: '#fff',
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer'
    };

    const handleMemberToggle = (userId: string) => {
        setForm(prev => ({
            ...prev,
            members: prev.members.includes(userId)
                ? prev.members.filter(id => id !== userId)
                : [...prev.members, userId]
        }));
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Teams</h1>
                    <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>{teams.length} teams</p>
                </div>
                <button onClick={() => { setShowCreate(true); setEditTeam(null); setForm({ name: '', description: '', manager: '', members: [] }); }} style={btnPrimary}>
                    <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> New Team
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10, padding: '8px 16px', maxWidth: 400, border: '1px solid #e5e7eb' }}>
                <Search size={16} color="#9ca3af" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, flex: 1 }} />
            </div>

            {/* Create/Edit Modal */}
            {(showCreate || editTeam) && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 500, maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>{editTeam ? 'Edit Team' : 'Create Team'}</h2>
                        <form onSubmit={editTeam ? handleUpdate : handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Manager</label>
                                <select value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} style={inputStyle} required>
                                    <option value="">Select a manager</option>
                                    {eligibleManagers.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Members</label>
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px', maxHeight: 200, overflowY: 'auto' }}>
                                    {eligibleMembers.length === 0 ? (
                                        <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>No members available</p>
                                    ) : (
                                        eligibleMembers.map(user => (
                                            <label key={user._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={form.members.includes(user._id)}
                                                    onChange={() => handleMemberToggle(user._id)}
                                                />
                                                <span style={{ fontSize: 14, color: '#374151' }}>
                                                    {user.name} ({user.email})
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                <small style={{ color: '#6b7280', fontSize: 12 }}>Select members by checking the boxes</small>
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                                <button type="button" onClick={() => { setShowCreate(false); setEditTeam(null); }} style={{ ...btnPrimary, background: '#f3f4f6', color: '#374151' }}>Cancel</button>
                                <button type="submit" style={btnPrimary}>{editTeam ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Team Cards (unchanged) */}
            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
            ) : filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                    <UsersRound size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                    <p>No teams found</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {filtered.map(t => (
                        <div key={t._id} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', transition: 'transform 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UsersRound size={22} color="#194f87" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{t.name}</div>
                                        {t.manager && (
                                            <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <UserCog size={12} /> {t.manager.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={() => openEdit(t)} style={{ background: '#dbeafe', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }}>
                                        <Edit2 size={14} color="#2563eb" />
                                    </button>
                                    <button onClick={() => handleDelete(t._id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }}>
                                        <Trash2 size={14} color="#dc2626" />
                                    </button>
                                </div>
                            </div>
                            {t.description && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.5 }}>{t.description}</p>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280' }}>
                                <Users size={14} />
                                {t.members?.length || 0} members
                            </div>
                            {t.members && t.members.length > 0 && (
                                <div style={{ display: 'flex', marginTop: 12, gap: -4 }}>
                                    {t.members.slice(0, 5).map((m, i) => (
                                        <div key={m._id} style={{
                                            width: 30, height: 30, borderRadius: '50%', background: `hsl(${i * 60 + 200}, 50%, 50%)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700,
                                            border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0
                                        }}>
                                            {m.name.charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                    {t.members.length > 5 && (
                                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#6b7280', border: '2px solid #fff', marginLeft: -8 }}>
                                            +{t.members.length - 5}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamsManagement;