import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import api from '../../services/api';
import { ArrowLeft, Calendar, Clock, User, Target, CheckCircle2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

interface Project {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    deadline: string;
    status: string;
    manager: { _id: string; name: string };
    team: { _id: string; name: string };
}

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    deadline: string;
    percentageComplete?: number;
    progress?: number;
    assignedTo: Array<{ _id: string; name: string }>;
    createdBy: { _id: string; name: string };
}

const ProjectDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id || id === 'undefined' || !user) return;
            try {
                const [projectRes, tasksRes] = await Promise.all([
                    api.get(`/projects/${id}`),
                    api.get('/tasks/my-tasks'),
                ]);

                const data = projectRes.data?.data || projectRes.data;
                setProject(data);

                // Filter tasks for this project that are assigned to the user
                const projectTasks = tasksRes.data.filter((task: Task) =>
                    task.project?._id === id &&
                    task.assignedTo.some((member) => member._id === user.id)
                );
                setTasks(projectTasks);
            } catch (err: any) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to load project details');
                navigate('/dashboard/projects');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user, navigate]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const downloadDescriptionAsPDF = () => {
        if (!project) return;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(project.name, 20, 20);
        doc.setFontSize(12);
        doc.text('Project Description:', 20, 40);
        const splitDescription = doc.splitTextToSize(project.description, 170);
        doc.text(splitDescription, 20, 50);
        doc.save(`${project.name}-description.pdf`);
        toast.success('Description downloaded as PDF');
    };

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            completed: '#10b981',
            'in-progress': '#3b82f6',
            in_progress: '#3b82f6',
            pending: '#9ca3af',
            'not-started': '#9ca3af',
        };
        return map[status?.toLowerCase()] || '#6b7280';
    };

    const getPriorityStyle = (priority: string) => {
        const map: Record<string, { bg: string; color: string }> = {
            high: { bg: '#fee2e2', color: '#dc2626' },
            critical: { bg: '#fee2e2', color: '#dc2626' },
            medium: { bg: '#fef3c7', color: '#d97706' },
            low: { bg: '#d1fae5', color: '#059669' },
        };
        return map[priority?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                Loading project details...
            </div>
        );
    }

    if (!project) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                Project not found
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <button
                    onClick={() => navigate('/dashboard/projects')}
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
                        marginBottom: 16,
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Projects
                </button>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>
                    {project.name}
                </h1>
            </div>

            {/* Project Info */}
            <div
                style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: '1px solid #f3f4f6',
                    marginBottom: 24,
                }}
            >
                <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>
                    Project Details
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                            style={{
                                color: '#6b7280',
                                lineHeight: 1.6,
                                margin: 0,
                                // Wrapping and overflow handling
                                overflowWrap: 'break-word',
                                wordWrap: 'break-word',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                // allow vertical growth but cap extremely long content
                                maxHeight: 240,
                                overflowY: 'auto',
                                paddingRight: 8,
                            }}
                        >
                            {project.description}
                        </p>
                    </div>
                    <button
                        onClick={downloadDescriptionAsPDF}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: '1px solid #d1d5db',
                            background: '#fff',
                            color: '#374151',
                            fontSize: 14,
                            cursor: 'pointer',
                            marginLeft: 16,
                        }}
                    >
                        <Download size={16} />
                        Download PDF
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <User size={16} color="#9ca3af" />
                        <span style={{ fontSize: 14, color: '#6b7280' }}>
                            Manager: {project.manager?.name || '—'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={16} color="#9ca3af" />
                        <span style={{ fontSize: 14, color: '#6b7280' }}>
                            Start: {formatDate(project.startDate)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={16} color="#9ca3af" />
                        <span style={{ fontSize: 14, color: '#6b7280' }}>
                            Deadline: {formatDate(project.deadline)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Target size={16} color="#9ca3af" />
                        <span
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: getStatusColor(project.status),
                                textTransform: 'capitalize',
                            }}
                        >
                            Status: {project.status?.replace('_', ' ') || '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* My Assigned Tasks */}
            <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
                    My Assigned Tasks ({tasks.length})
                </h2>
                {tasks.length === 0 ? (
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 16,
                            padding: 40,
                            textAlign: 'center',
                            color: '#9ca3af',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            border: '1px solid #f3f4f6',
                        }}
                    >
                        <CheckCircle2 size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                        <p>No tasks assigned to you in this project</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {tasks.map((task) => (
                            <div
                                key={task._id}
                                style={{
                                    background: '#fff',
                                    borderRadius: 14,
                                    padding: '18px 24px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                    border: '1px solid #f3f4f6',
                                    cursor: 'pointer',
                                }}
                                onClick={() => navigate(`/dashboard/tasks?task=${task._id}`)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
                                            {task.title}
                                        </h3>
                                        {task.description && (
                                            <p
                                                style={{
                                                    fontSize: 14,
                                                    color: '#6b7280',
                                                    margin: '4px 0',
                                                    // Wrapping rules to avoid overflow on long words/URLs
                                                    overflowWrap: 'break-word',
                                                    wordWrap: 'break-word',
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'normal',
                                                }}
                                            >
                                                {task.description}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span
                                            style={{
                                                background: getPriorityStyle(task.priority).bg,
                                                color: getPriorityStyle(task.priority).color,
                                                padding: '2px 8px',
                                                borderRadius: 6,
                                                fontSize: 10,
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {task.priority}
                                        </span>
                                        <select
                                            value={task.status}
                                            disabled
                                            style={{
                                                padding: '2px 8px',
                                                borderRadius: 6,
                                                border: 'none',
                                                fontSize: 10,
                                                fontWeight: 600,
                                                color: '#fff',
                                                background: getStatusColor(task.status),
                                            }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {(task.percentageComplete !== undefined || task.progress !== undefined) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <div
                                            style={{
                                                flex: 1,
                                                height: 5,
                                                borderRadius: 3,
                                                background: '#f3f4f6',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${task.percentageComplete ?? task.progress ?? 0}%`,
                                                    height: '100%',
                                                    borderRadius: 3,
                                                    background: '#334155',
                                                    transition: 'width 0.3s',
                                                }}
                                            />
                                        </div>
                                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                                            {task.percentageComplete ?? task.progress ?? 0}%
                                        </span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#9ca3af' }}>
                                    <span>Created by {task.createdBy.name}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={12} />
                                        {formatDate(task.deadline)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;