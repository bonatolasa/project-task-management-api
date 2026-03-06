import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
            <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <div
                style={{
                    flex: 1,
                    marginLeft: collapsed ? 72 : 260,
                    transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <AdminHeader />
                <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1440, width: '100%' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
