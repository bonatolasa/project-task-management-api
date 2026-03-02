import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from './store/store';
import LandingPage from './LandingPage';
import { Login } from './Component/auth/Login';
import { Signup } from './Component/auth/Signup';

// Admin
import { AdminLayout } from './Component/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ProjectsManagement from './pages/admin/ProjectsManagement';
import UsersManagement from './pages/admin/UsersManagement';
import TeamsManagement from './pages/admin/TeamsManagement';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/SettingsPage';

// Project Manager
import { PromanagerLayout } from './Component/projectmanager/PromanagerLayout';
import ProjectManagerDashboard from './pages/projectManager/ProjectManagerDashboard';
import ManagerProjects from './pages/projectManager/Projects';
import ManagerTasks from './pages/projectManager/Tasks';
import ManagerReports from './pages/projectManager/Reports';
import ManagerSettings from './pages/projectManager/Settings';

// Team Member
import { TeamMemberLayout } from './Component/teamMember/TeamMemberLayout';
import Dashboard from './pages/teamMember/Dashboard';
import MemberTasks from './pages/teamMember/Tasks';
import MemberProgress from './pages/teamMember/Progress';
import MemberProfile from './pages/teamMember/Profile';

/** Redirect unauthenticated users to /login */
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
    children,
    allowedRoles,
}) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'manager') return <Navigate to="/manager" replace />;
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* ═══ Admin Routes ═══ */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardOverview />} />
                <Route path="projects" element={<ProjectsManagement />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="teams" element={<TeamsManagement />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* ═══ Project Manager Routes ═══ */}
            <Route
                path="/manager"
                element={
                    <ProtectedRoute allowedRoles={['manager']}>
                        <PromanagerLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<ProjectManagerDashboard />} />
                <Route path="projects" element={<ManagerProjects />} />
                <Route path="tasks" element={<ManagerTasks />} />
                <Route path="reports" element={<ManagerReports />} />
                <Route path="settings" element={<ManagerSettings />} />
            </Route>

            {/* ═══ Team Member Routes ═══ */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['member']}>
                        <TeamMemberLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<MemberTasks />} />
                <Route path="progress" element={<MemberProgress />} />
                <Route path="profile" element={<MemberProfile />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
