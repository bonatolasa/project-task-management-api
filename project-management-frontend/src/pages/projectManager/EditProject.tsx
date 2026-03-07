import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import api from '../../services/api';
import { ArrowLeft, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamOption {
    _id?: string;
    id?: string;
    name: string;
}

type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

const EditProject: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const userAny = user as unknown as { id?: string; _id?: string } | null;

    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<TeamOption[]>([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        status: 'planning' as ProjectStatus,
        team: '',
        startDate: '',
        deadline: '',
    });

    const userId = userAny?.id || userAny?._id;

    useEffect(() => {
        const fetchData = async () => {
            if (!id || !userId) return;
            try {
                const [projectRes, teamsRes] = await Promise.all([
                    api.get(`/projects/${id}`),
                    api.get('/teams')
                ]);

                const project = projectRes.data?.data || projectRes.data;
                const teamsData = teamsRes.data?.data || teamsRes.data?.teams || teamsRes.data;

                setTeams(Array.isArray(teamsData) ? teamsData : []);
                setForm({
                    name: project.name || '',
                    description: project.description || '',
                    status: project.status || 'planning',
                    team: project.team?.id || project.team?._id || project.team || '',
                    startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
                    deadline: project.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : '',
                });
            } catch (err) {
                console.error('Failed to fetch edit data:', err);
                toast.error('Failed to load project details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, userId]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch(`/projects/${id}`, {
                ...form,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
                deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
            });
            toast.success('Project updated successfully');
            navigate(`/manager/projects/${id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update project');
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

    const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' };
    const btnPrimary: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, border: 'none', background: '#0f5841', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <button
                onClick={() => navigate(-1)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#0f5841', fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>Edit Project</h1>

                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Project Name</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })} style={inputStyle}>
                                <option value="planning">Planning</option>
                                <option value="in_progress">In Progress</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Assigned Team</label>
                            <select value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} required style={inputStyle}>
                                <option value="">Select team</option>
                                {teams.map(t => (
                                    <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Start Date</label>
                            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Deadline</label>
                            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                        <button type="button" onClick={() => navigate(-1)} style={{ ...btnPrimary, background: '#f3f4f6', color: '#374151' }}>
                            <X size={16} /> Cancel
                        </button>
                        <button type="submit" style={btnPrimary}>
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProject;
