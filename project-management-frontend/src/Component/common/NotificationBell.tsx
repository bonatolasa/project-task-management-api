import React, { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService';
import type { NotificationItem } from '../../types/collaboration';

interface Props {
    accentColor?: string;
}

export const NotificationBell: React.FC<Props> = ({ accentColor = '#ef4444' }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [open, setOpen] = useState(false);

    const unreadCount = useMemo(
        () => notifications.filter(n => !n.readStatus).length,
        [notifications],
    );

    const load = async () => {
        try {
            const data = await collaborationService.getNotifications();
            setNotifications(data.slice(0, 15));
        } catch {
            // silent
        }
    };

    useEffect(() => {
        load();
        const timer = setInterval(load, 15000);
        return () => clearInterval(timer);
    }, []);

    const markOne = async (id: string) => {
        await collaborationService.markNotificationRead(id);
        setNotifications(prev =>
            prev.map(item => (item._id === id ? { ...item, readStatus: true } : item)),
        );
    };

    const markAll = async () => {
        await collaborationService.markAllNotificationsRead();
        setNotifications(prev => prev.map(item => ({ ...item, readStatus: true })));
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Bell size={20} color="#6b7280" />
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: -3,
                            right: -1,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 999,
                            background: accentColor,
                            color: '#fff',
                            fontSize: 10,
                            lineHeight: '16px',
                            textAlign: 'center',
                            padding: '0 4px',
                            fontWeight: 700,
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 42,
                        width: 360,
                        maxHeight: 420,
                        overflowY: 'auto',
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        zIndex: 80,
                    }}
                >
                    <div
                        style={{
                            padding: '12px 14px',
                            borderBottom: '1px solid #f3f4f6',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <strong style={{ fontSize: 14 }}>Notifications</strong>
                        <button
                            onClick={markAll}
                            style={{ border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer' }}
                        >
                            Mark all read
                        </button>
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ padding: 18, color: '#9ca3af', fontSize: 13 }}>No notifications</div>
                    ) : (
                        notifications.map(item => (
                            <button
                                key={item._id}
                                onClick={() => !item.readStatus && markOne(item._id)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    border: 'none',
                                    textAlign: 'left',
                                    background: item.readStatus ? '#fff' : '#f8fafc',
                                    padding: '12px 14px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f3f4f6',
                                }}
                            >
                                <div style={{ fontSize: 13, color: '#111827', fontWeight: item.readStatus ? 500 : 700 }}>
                                    {item.message}
                                </div>
                                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                                    {new Date(item.createdAt).toLocaleString()}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

