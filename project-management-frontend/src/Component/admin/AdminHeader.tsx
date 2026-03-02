import React from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { Bell, Search } from 'lucide-react';

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
                <button
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
                    <span
                        style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#ef4444',
                        }}
                    />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                </div>
            </div>
        </header>
    );
};
