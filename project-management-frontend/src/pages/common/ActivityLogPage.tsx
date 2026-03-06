import React, { useEffect, useMemo, useState } from 'react';
import { collaborationService } from '../../services/collaborationService';
import type { ActivityItem } from '../../types/collaboration';

const actionTypes = [
    'task_created',
    'task_updated',
    'task_deleted',
    'user_assigned',
    'project_created',
    'status_changed',
];

const ActivityLogPage: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [actionFilter, setActionFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await collaborationService.getActivities(
                    actionFilter === 'all' ? undefined : actionFilter,
                );
                setActivities(data);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [actionFilter]);

    const rows = useMemo(() => activities, [activities]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Activity Log</h1>
                <select
                    value={actionFilter}
                    onChange={e => setActionFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
                >
                    <option value="all">All actions</option>
                    {actionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 24, color: '#9ca3af' }}>Loading activities...</div>
                ) : rows.length === 0 ? (
                    <div style={{ padding: 24, color: '#9ca3af' }}>No activities found</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#9ca3af' }}>Action</th>
                                <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#9ca3af' }}>User</th>
                                <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#9ca3af' }}>Description</th>
                                <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#9ca3af' }}>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(item => (
                                <tr key={item._id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                    <td style={{ padding: 12, fontWeight: 600 }}>{item.actionType}</td>
                                    <td style={{ padding: 12 }}>{item.performedBy?.name || 'System'}</td>
                                    <td style={{ padding: 12 }}>{item.description}</td>
                                    <td style={{ padding: 12, color: '#6b7280' }}>
                                        {new Date(item.createdAt).toLocaleString()}
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

export default ActivityLogPage;

