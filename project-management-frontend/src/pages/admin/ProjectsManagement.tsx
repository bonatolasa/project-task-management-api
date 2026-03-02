import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
    _id: string;
    name: string;
    description?: string;
    status: string;
    deadline: string;
    startDate?: string;
    progress?: number;
    manager?: { _id: string; name: string; email: string };
    team?: { _id: string; name: string };
}

const ProjectsManagement: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            const responseData = res.data;
            let projectsData = responseData.data || responseData.projects || responseData;
            if (!Array.isArray(projectsData)) projectsData = [];

            // Normalize: ensure each project has an _id (map from id if necessary)
            const normalized = projectsData.map((p: any) => ({
                ...p,
                _id: p._id || p.id,
            }));
            setProjects(normalized);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const getStatusColor = (s: string) => {
        const m: Record<string, string> = {
            completed: '#10b981',
            'in-progress': '#3b82f6',
            active: '#3b82f6',
            planning: '#8b5cf6',
            'on-hold': '#f59e0b'
        };
        return m[s?.toLowerCase()] || '#6b7280';
    };

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    const cardStyle: React.CSSProperties = {
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #f3f4f6',
        overflow: 'hidden'
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Projects</h1>
                <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>{projects.length} total projects</p>
            </div>

            {/* Search */}
            <div style={{
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                borderRadius: 10,
                padding: '8px 16px',
                maxWidth: 400,
                border: '1px solid #e5e7eb'
            }}>
                <Search size={16} color="#9ca3af" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search projects..."
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, flex: 1 }}
                />
            </div>

            {/* Table */}
            <div style={cardStyle}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                        <FolderKanban size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                        <p>No projects found</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                {['Name', 'Status', 'Progress', 'Deadline', 'Manager'].map(h => (
                                    <th key={h} style={{
                                        padding: '14px 20px',
                                        textAlign: 'left',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: '#9ca3af',
                                        textTransform: 'uppercase'
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr
                                    key={p._id}
                                    style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14, color: '#111827' }}>{p.name}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: 20,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: '#fff',
                                            background: getStatusColor(p.status),
                                            textTransform: 'capitalize'
                                        }}>
                                            {p.status?.replace(/[-_]/g, ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 60, height: 6, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                                                <div style={{ width: `${p.progress || 0}%`, height: '100%', borderRadius: 3, background: '#194f87' }} />
                                            </div>
                                            <span style={{ fontSize: 12, color: '#6b7280' }}>{p.progress || 0}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280' }}>{formatDate(p.deadline)}</td>
                                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280' }}>{p.manager?.name || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProjectsManagement;