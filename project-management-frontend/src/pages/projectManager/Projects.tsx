import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import api from '../../services/api';
import { getManagerProjects } from '../../services/dashboardService';
import { Plus, Search, Trash2, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
    _id: string;
    name: string;
    description?: string;
    status: string;
    deadline: string;
    progress?: number;
    team?: { _id: string; name: string };
}

interface TeamOption {
    _id?: string;
    id?: string;
    name: string;
}

type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

const Projects: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<TeamOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        status: 'planning' as ProjectStatus,
        team: '',
        startDate: new Date().toISOString().slice(0, 10),
        deadline: '',
    });

    const fetchProjects = async () => {
        if (!user?.id) return;
        try {
            const res = await getManagerProjects(user.id);
            const data = res.data || res;
            setProjects(Array.isArray(data) ? data : data?.projects || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProjects(); }, [user?.id]);

    useEffect(() => {
        const fetchTeams = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/teams/manager/${user.id}`);
                const data = res.data?.data || [];
                setTeams(Array.isArray(data) ? data : []);
            } catch {
                setTeams([]);
            }
        };

        fetchTeams();
    }, [user?.id]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            toast.error('Manager account not found');
            return;
        }

        try {
            await api.post('/projects', {
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                team: form.team,
                manager: user.id,
                startDate: new Date(form.startDate).toISOString(),
                deadline: new Date(form.deadline).toISOString(),
                status: form.status,
            });
            toast.success('Project created!');
            setShowCreate(false);
            setForm({
                name: '',
                description: '',
                status: 'planning',
                team: '',
                startDate: new Date().toISOString().slice(0, 10),
                deadline: '',
            });
            fetchProjects();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this project?')) return;
        try {
            await api.delete(`/projects/${id}`);
            toast.success('Deleted');
            fetchProjects();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    const getStatusColor = (s: string) => {
        const m: Record<string, string> = { completed: '#10b981', in_progress: '#3b82f6', planning: '#8b5cf6', on_hold: '#f59e0b', cancelled: '#ef4444' };
        return m[s?.toLowerCase()] || '#6b7280';
    };
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' };
    const btnPrimary: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, border: 'none', background: '#0f5841', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>My Projects</h1>
                <button onClick={() => setShowCreate(true)} style={btnPrimary}>
                    <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> New Project
                </button>
            </div>

            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10, padding: '8px 16px', maxWidth: 400, border: '1px solid #e5e7eb' }}>
                <Search size={16} color="#9ca3af" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, flex: 1 }} />
            </div>

            {showCreate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 480 }}>
                        <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>New Project</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Project name" style={inputStyle} />
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                            <select value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} required style={inputStyle}>
                                <option value="">Select team</option>
                                {teams.map((team) => (
                                    <option key={team._id || team.id} value={team._id || team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })} style={inputStyle}>
                                    <option value="planning">Planning</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input type="date" required value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowCreate(false)} style={{ ...btnPrimary, background: '#f3f4f6', color: '#374151' }}>Cancel</button>
                                <button type="submit" style={btnPrimary}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {filtered.map(p => (
                        <div key={p._id} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', transition: 'transform 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{p.name}</span>
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#fff', background: getStatusColor(p.status), textTransform: 'capitalize' }}>
                                    {p.status?.replace(/[-_]/g, ' ')}
                                </span>
                            </div>
                            {p.description && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>{p.description}</p>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                                    <div style={{ width: `${p.progress || 0}%`, height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #0f5841, #1b7a5c)' }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#0f5841' }}>{p.progress || 0}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', gap: 12 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {formatDate(p.deadline)}</span>
                                    {p.team && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {p.team.name}</span>}
                                </div>
                                <button onClick={() => handleDelete(p._id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer' }}>
                                    <Trash2 size={13} color="#dc2626" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Projects;
