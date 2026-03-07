import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Clock, Target, AlertCircle } from 'lucide-react';
import TaskCollaboration from '../../components/TaskCollaboration';
import toast from 'react-hot-toast';

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    deadline: string;
    project?: { _id: string; name: string };
    assignedTo: Array<{ _id: string; name: string }>;
    createdBy: { _id: string; name: string };
    percentageComplete?: number;
}

const TaskDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTask = async () => {
            if (!id) return;
            try {
                const res = await api.get(`/tasks/${id}`);
                const data = res.data?.data || res.data;
                setTask(data);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load task details');
                navigate('/dashboard/tasks');
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
    }, [id, navigate]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading task...</div>;
    if (!task) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Task not found</div>;

    const getStatusColor = (s: string) => ({
        completed: '#10b981',
        in_progress: '#3b82f6',
        overdue: '#dc2626',
        pending: '#9ca3af',
    }[s?.toLowerCase()] || '#6b7280');

    const getPriorityColor = (p: string) => ({
        high: '#dc2626',
        critical: '#dc2626',
        medium: '#d97706',
        low: '#059669',
    }[p?.toLowerCase()] || '#6b7280');

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    fontSize: 14,
                    cursor: 'pointer',
                    marginBottom: 24,
                }}
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                <div>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '32px', border: '1px solid #f3f4f6', marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>{task.title}</h1>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: getStatusColor(task.status),
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                            }}>
                                {task.status.replace('_', ' ')}
                            </span>
                        </div>

                        <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: 1.6, marginBottom: 24 }}>
                            {task.description || 'No description provided.'}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '10px' }}>
                                    <Target size={20} color="#6b7280" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Project</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{task.project?.name || 'Independent Task'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '10px' }}>
                                    <AlertCircle size={20} color={getPriorityColor(task.priority)} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Priority</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: getPriorityColor(task.priority), textTransform: 'capitalize' }}>
                                        {task.priority}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '10px' }}>
                                    <Clock size={20} color="#6b7280" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Deadline</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                                        {new Date(task.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <TaskCollaboration taskId={task._id} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #f3f4f6' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Team Members</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {task.assignedTo.map(user => (
                                <div key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, color: '#4b5563' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{user.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #f3f4f6' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Manager</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0f5841', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, color: '#fff' }}>
                                {task.createdBy?.name?.charAt(0) || 'M'}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 500 }}>{task.createdBy?.name || 'Manager'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
