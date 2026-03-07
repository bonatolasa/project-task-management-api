import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Project {
    id: string;
    name: string;
}

const TeamProjects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);

    const fetchProjects = async () => {
        try {
            if (!user) return;
            const res = await api.get(`/projects/contributor/${user.id}`);
            const data = res.data || res;
            const projects = Array.isArray(data) ? data : data?.data || [];
            // ensure correct id field
            const normalized = projects.map((p: any) => ({ id: p.id || p._id || '', name: p.name }));
            setProjects(normalized);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load your projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);



    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Projects</h1>
            </div>
            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
            ) : projects.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                    <Users size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                    <p>You have no projects yet</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {projects.map(p => (
                        <div key={p.id} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', cursor: 'pointer' }}
                            onClick={() => navigate(`/dashboard/projects/${p.id}`)}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{p.name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamProjects;
