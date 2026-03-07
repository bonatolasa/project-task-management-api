import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { Search } from 'lucide-react';
import { NotificationBell } from '../common/NotificationBell';

export const AdminHeader: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <header
            style={{
                height: 68,
                background: '#fff',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
                position: 'sticky',
                top: 0,
                zIndex: 30,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#f3f4f6',
                        borderRadius: 10,
                        padding: '8px 16px',
                        width: 320,
                    }}
                >
                    <Search size={16} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontSize: 14,
                            color: '#374151',
                            width: '100%',
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <NotificationBell accentColor="#194f87" />

                <Link to="/admin/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #194f87, #2a6fb0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 14,
                        }}
                    >
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                            {user?.name || 'Admin'}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>Administrator</div>
                    </div>
                </Link>
            </div>
        </header>
    );
};
