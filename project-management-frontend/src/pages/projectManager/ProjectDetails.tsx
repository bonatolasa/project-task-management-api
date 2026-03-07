import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { ArrowLeft, Clock, Users, ListTodo, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { normalizeRole } from '../../utils/auth';

interface Project {
    _id: string;
    name: string;
    description?: string;
    status: string;
    deadline: string;
    progress?: number;
    team?: { _id: string; name: string };
    projectVisibility?: string;
}

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    deadline: string;
    assignedTo?: { _id: string; name: string }[];
}

interface TeamMember {
    id?: string;
    _id?: string;
    name: string;
    email?: string;
}

interface TeamInfo {
    id?: string;
    _id?: string;
    name: string;
    manager?: TeamMember;
    members?: TeamMember[];
}

interface MemberProgress {
    memberId: string;
    memberName: string;
    totalTasks: number;
    completedTasks: number;
    progress: number;
}

const ProjectDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state: RootState) => state.auth.user);
    const userAny = user as unknown as { id?: string; _id?: string; role?: string } | null;
    // normalized role for current user (admin/manager/member)
    const role = normalizeRole(userAny?.role);
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [memberProgress, setMemberProgress] = useState<MemberProgress[]>([]);
    const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
    const [assigningTaskId, setAssigningTaskId] = useState<string>('');
    const [selectedAssigneeByTask, setSelectedAssigneeByTask] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const projectFromState = location.state?.project as Project | undefined;

    // decide where the back button should lead based on role
    const backPath = role === 'member' ? '/dashboard/tasks' : '/manager/projects';

    useEffect(() => {
        const fetchData = async () => {
            if (!id || id === 'undefined') {
                toast.error('Invalid project ID');
                navigate('/manager/projects');
                return;
            }

            try {
                const [projectRes, tasksRes] = await Promise.all([
                    api.get(`/projects/${id}`),
                    api.get(`/tasks?projectId=${id}`),
                ]);

                // Extract project
                let projectData = null;
                if (projectRes.data?.data) {
                    projectData = projectRes.data.data;
                } else if (projectRes.data?.project) {
                    projectData = projectRes.data.project;
                } else {
                    projectData = projectRes.data;
                }
                setProject(projectData);

                const teamId = projectData?.team?._id;
                if (teamId) {
                    try {
                        const teamRes = await api.get(`/teams/${teamId}`);
                        const tData = teamRes.data?.data || teamRes.data;
                        setTeamInfo(tData);
                    } catch {
                        setTeamInfo(null);
                    }
                }

                // Extract tasks
                let tasksArray: Task[] = [];
                const tasksData = tasksRes.data;
                if (tasksData?.data && Array.isArray(tasksData.data)) {
                    tasksArray = tasksData.data;
                } else if (tasksData?.tasks && Array.isArray(tasksData.tasks)) {
                    tasksArray = tasksData.tasks;
                } else if (Array.isArray(tasksData)) {
                    tasksArray = tasksData;
                } else if (tasksData?.results && Array.isArray(tasksData.results)) {
                    tasksArray = tasksData.results;
                }
                setTasks(tasksArray);

                // Compute member progress
                const progressMap = new Map<string, MemberProgress>();
                tasksArray.forEach((task: Task) => {
                    const assignees = task.assignedTo || [];
                    assignees.forEach((assignee) => {
                        const memberId = assignee._id;
                        const memberName = assignee.name;
                        if (!progressMap.has(memberId)) {
                            progressMap.set(memberId, {
                                memberId,
                                memberName,
                                totalTasks: 0,
                                completedTasks: 0,
                                progress: 0,
                            });
                        }
                        const entry = progressMap.get(memberId)!;
                        entry.totalTasks++;
                        if (task.status === 'completed') {
                            entry.completedTasks++;
                        }
                    });
                });
                progressMap.forEach((entry) => {
                    entry.progress = entry.totalTasks > 0 ? (entry.completedTasks / entry.totalTasks) * 100 : 0;
                });
                setMemberProgress(Array.from(progressMap.values()));
            } catch (err: any) {
                console.error('Error fetching project details:', err);
                if (err.response) {
                    console.error('Response data:', JSON.stringify(err.response.data));
                    console.error('Response status:', err.response.status);

                    if (err.response.status === 403) {
                        // If we have project data from state, use it as fallback
                        if (projectFromState) {
                            toast('Showing cached project info (tasks unavailable)');
                            setProject(projectFromState);
                            setTasks([]); // tasks not available
                            setMemberProgress([]);
                            setLoading(false);
                            return;
                        } else {
                            toast.error('You do not have permission to view this project');
                            setTimeout(() => navigate(backPath), 2000);
                            return;
                        }
                    }
                }
                toast.error('Failed to load project details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate, projectFromState]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            completed: '#10b981',
            in_progress: '#3b82f6',
            planning: '#8b5cf6',
            on_hold: '#f59e0b',
            cancelled: '#ef4444',
        };
        return map[status?.toLowerCase()] || '#6b7280';
    };

    const getPriorityColor = (priority: string) => {
        const map: Record<string, string> = {
            high: '#dc2626',
            critical: '#dc2626',
            medium: '#d97706',
            low: '#059669',
        };
        return map[priority?.toLowerCase()] || '#6b7280';
    };

    const canAssignTasks = (() => {
        const userId = userAny?.id || userAny?._id;
        const managerId = teamInfo?.manager?._id || teamInfo?.manager?.id;
        return role === 'manager' && !!userId && !!managerId && userId === managerId;
    })();

    const handleAssignTask = async (taskId: string) => {
        const assignee = selectedAssigneeByTask[taskId];
        if (!assignee) {
            toast.error('Please select a team member');
            return;
        }

        try {
            setAssigningTaskId(taskId);
            await api.patch(`/tasks/${taskId}`, { assignedTo: [assignee] });
            toast.success('Task assigned successfully');

            setTasks((prev) =>
                prev.map((t) =>
                    t._id === taskId
                        ? {
                            ...t,
                            assignedTo:
                                teamInfo?.members?.find((m) => (m._id || m.id) === assignee)
                                    ? [{
                                        _id: assignee,
                                        name: teamInfo.members.find((m) => (m._id || m.id) === assignee)?.name || 'Assigned',
                                    }]
                                    : t.assignedTo,
                        }
                        : t,
                ),
            );
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to assign task');
        } finally {
            setAssigningTaskId('');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <h2>Project not found</h2>
                <button onClick={() => navigate('/manager/projects')}>Go back</button>
            </div>
        );
    }


    return (
        <div>
            <button
                onClick={() => navigate(backPath)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#0f5841', fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}
            >
                <ArrowLeft size={16} /> Back to Projects
            </button>

            <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{project.name}</h1>
                        {project.description && (
                            <p
                                style={{
                                    color: '#6b7280',
                                    marginBottom: 16,
                                    marginTop: 4,
                                    // wrapping rules
                                    overflowWrap: 'break-word',
                                    wordWrap: 'break-word',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'normal',
                                    maxHeight: 240,
                                    overflowY: 'auto',
                                }}
                            >
                                {project.description}
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                            style={{
                                padding: '4px 12px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#fff',
                                background: getStatusColor(project.status),
                                textTransform: 'capitalize',
                            }}
                        >
                            {project.status?.replace(/[-_]/g, ' ')}
                        </span>
                        <button
                            onClick={() => navigate(`/manager/projects/edit/${id}`)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 12px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #e5e7eb',
                                cursor: 'pointer'
                            }}
                        >
                            <Pencil size={12} /> Edit
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={16} color="#9ca3af" />
                        <span style={{ fontSize: 14, color: '#374151' }}>Deadline: {formatDate(project.deadline)}</span>
                    </div>
                    {project.team && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={16} color="#9ca3af" />
                            <span style={{ fontSize: 14, color: '#374151' }}>Team: {project.team.name}</span>
                        </div>
                    )}
                    {project.projectVisibility && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14, color: '#374151' }}>Visibility: {project.projectVisibility}</span>
                        </div>
                    )}
                </div>
                <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#f3f4f6', overflow: 'hidden' }}>
                            <div
                                style={{
                                    width: `${project.progress || 0}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #0f5841, #1b7a5c)',
                                    borderRadius: 4,
                                }}
                            />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f5841' }}>{project.progress || 0}%</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Tasks List */}
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ListTodo size={20} color="#0f5841" /> Tasks ({tasks.length})
                    </h2>
                    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {tasks.length === 0 ? (
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>No tasks for this project</p>
                        ) : (
                            tasks.map((task) => (
                                <div key={task._id} style={{ padding: '12px 0', borderBottom: '1px solid #f9fafb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <span
                                            onClick={() => navigate(`/manager/tasks/${task._id}`)}
                                            style={{ fontWeight: 600, color: '#0f5841', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            {task.title}
                                        </span>
                                        <span
                                            style={{
                                                padding: '2px 8px',
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                background: getPriorityColor(task.priority),
                                                color: '#fff',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>
                                    {task.description && (
                                        <p
                                            style={{
                                                fontSize: 14,
                                                color: '#6b7280',
                                                margin: '4px 0',
                                                overflowWrap: 'break-word',
                                                wordWrap: 'break-word',
                                                wordBreak: 'break-word',
                                                whiteSpace: 'normal',
                                            }}
                                        >
                                            {task.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#6b7280' }}>
                                        <span>Assignee: {task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo.map(a => a.name).join(', ') : 'Unassigned'}</span>
                                        <span
                                            style={{
                                                padding: '2px 8px',
                                                borderRadius: 12,
                                                background: task.status === 'completed' ? '#d1fae5' : '#f3f4f6',
                                                color: task.status === 'completed' ? '#059669' : '#6b7280',
                                                fontWeight: 600,
                                                fontSize: 11,
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                                        <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                        {formatDate(task.deadline)}
                                    </div>
                                    {canAssignTasks && (
                                        <div style={{ marginTop: 8 }}>
                                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Assign to member:</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {(teamInfo?.members || []).map((member) => {
                                                    const memberId = member._id || member.id;
                                                    if (!memberId) return null;
                                                    return (
                                                        <label key={memberId} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                                            <input
                                                                type="radio"
                                                                name={`assignee-${task._id}`}
                                                                value={memberId}
                                                                checked={selectedAssigneeByTask[task._id] === memberId}
                                                                onChange={(e) => setSelectedAssigneeByTask((prev) => ({ ...prev, [task._id]: e.target.value }))}
                                                            />
                                                            {member.name}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => handleAssignTask(task._id)}
                                                disabled={assigningTaskId === task._id || !selectedAssigneeByTask[task._id]}
                                                style={{ marginTop: 8, padding: '6px 10px', border: 'none', borderRadius: 8, background: '#0f5841', color: '#fff', cursor: 'pointer', fontSize: 12 }}
                                            >
                                                {assigningTaskId === task._id ? 'Assigning...' : 'Assign'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Member Progress */}
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={20} color="#0f5841" /> Team Member Progress
                    </h2>
                    {memberProgress.length === 0 ? (
                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>No members assigned to tasks</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {memberProgress.map((member) => (
                                <div key={member.memberId}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600, color: '#111827' }}>{member.memberName}</span>
                                        <span style={{ fontSize: 13, color: '#6b7280' }}>
                                            {member.completedTasks}/{member.totalTasks} tasks
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    width: `${member.progress}%`,
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, #0f5841, #1b7a5c)',
                                                    borderRadius: 3,
                                                }}
                                            />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0f5841' }}>{member.progress.toFixed(0)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {teamInfo && (
                        <div style={{ marginTop: 20, borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                            <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Team Details</h3>
                            <div style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>
                                <strong>Manager:</strong> {teamInfo.manager?.name || 'N/A'}
                            </div>
                            <div style={{ fontSize: 13, color: '#374151' }}>
                                <strong>Members:</strong>{' '}
                                {(teamInfo.members || []).length > 0
                                    ? teamInfo.members?.map((m) => m.name).join(', ')
                                    : 'No members'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;

