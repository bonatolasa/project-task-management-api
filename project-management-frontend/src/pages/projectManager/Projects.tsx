import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getManagerProjects } from '../../services/dashboardService';
import { Plus, Search, Trash2, Clock, Users, Eye, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
    _id?: string;
    id?: string;          // some backends use `id`
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

interface TeamMember {
    _id?: string;
    id?: string;
    name: string;
    email?: string;
}

type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

const Projects: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const userAny = user as unknown as { id?: string; _id?: string } | null;
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<TeamOption[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
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

    const userId = userAny?.id || userAny?._id;

    const fetchProjects = async () => {
        if (!userId) return;
        try {
            const res = await getManagerProjects(userId);
            const data = res.data || res;
            const projectsArray = Array.isArray(data) ? data : data?.projects || [];
            setProjects(projectsArray);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [userId]);

    useEffect(() => {
        const fetchTeams = async () => {
            if (!userId) return;
            try {
                const res = await api.get('/teams');
                const responseData = res.data;
                const teamsArray = responseData?.data || responseData?.teams || responseData;
                setTeams(Array.isArray(teamsArray) ? teamsArray : []);
            } catch (err) {
                console.error('Failed to fetch teams:', err);
                setTeams([]);
            }
        };
        fetchTeams();
    }, [userId]);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            if (!form.team) {
                setTeamMembers([]);
                return;
            }
            try {
                const res = await api.get(`/teams/${form.team}`);
                const teamData = res.data?.data || res.data;
                setTeamMembers(teamData?.members || []);
            } catch (err) {
                console.error('Failed to fetch team members:', err);
                setTeamMembers([]);
            }
        };
        fetchTeamMembers();
    }, [form.team]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            toast.error('Manager account not found');
            return;
        }
        try {
            await api.post('/projects', {
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                team: form.team,
                manager: userId,
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
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create');
        }
    };

    const handleDelete = async (id: string) => {
        if (!id) return;
        if (!confirm('Delete this project?')) return;
        try {
            await api.delete(`/projects/${id}`);
            toast.success('Deleted');
            fetchProjects();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed');
        }
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
                        {teams.length === 0 && (
                            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                                <p style={{ margin: 0, color: '#92400e', fontSize: 14 }}>
                                    ⚠️ No teams are available. Please contact an administrator to create teams before creating projects.
                                </p>
                            </div>
                        )}
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Project name" style={inputStyle} />
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                            <select value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} required style={inputStyle}>
                                <option value="">Select team</option>
                                {teams.length === 0 ? (
                                    <option disabled>No teams available</option>
                                ) : (
                                    teams.map((team) => (
                                        <option key={team._id || team.id} value={team._id || team.id}>
                                            {team.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {form.team && teamMembers.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                                        Team Members ({teamMembers.length}):
                                    </label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 100, overflowY: 'auto', padding: 8, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                                        {teamMembers.map((member) => (
                                            <div key={member._id || member.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 12 }}>
                                                <span>{member.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                <button type="submit" disabled={teams.length === 0} style={{ ...btnPrimary, opacity: teams.length === 0 ? 0.5 : 1, cursor: teams.length === 0 ? 'not-allowed' : 'pointer' }}>
                                    {teams.length === 0 ? 'No teams available' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {filtered.map(p => {
                        const projectId = p._id || p.id;
                        if (!projectId) return null;
                        return (
                            <div key={projectId} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', transition: 'transform 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{p.name}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#fff', background: getStatusColor(p.status), textTransform: 'capitalize' }}>
                                        {p.status?.replace(/[-_]/g, ' ')}
                                    </span>
                                </div>
                                {p.description && (
                                    <p
                                        style={{
                                            fontSize: 13,
                                            color: '#6b7280',
                                            margin: '0 0 12px',
                                            lineHeight: 1.5,
                                            overflowWrap: 'break-word',
                                            wordWrap: 'break-word',
                                            wordBreak: 'break-word',
                                            whiteSpace: 'normal',
                                            maxHeight: 100,
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {p.description}
                                    </p>
                                )}
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
                                    <div>
                                        <button
                                            onClick={() => navigate(`/manager/projects/${projectId}`, { state: { project: p } })}
                                            style={{ background: '#dbeafe', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', marginRight: 6 }}
                                        >
                                            <Eye size={13} color="#2563eb" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/manager/projects/edit/${projectId}`)}
                                            style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', marginRight: 6 }}
                                            title="Edit Project"
                                        >
                                            <Pencil size={13} color="#4b5563" />
                                        </button>
                                        <button onClick={() => handleDelete(projectId)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer' }}>
                                            <Trash2 size={13} color="#dc2626" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Projects;
