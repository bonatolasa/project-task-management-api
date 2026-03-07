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
import ActivityLogPage from './pages/common/ActivityLogPage';
import ProjectDetails from './pages/projectManager/ProjectDetails';
import EditProject from './pages/projectManager/EditProject';
import TaskDetails from './pages/projectManager/TaskDetails';

// Team Member
import { TeamMemberLayout } from './Component/teamMember/TeamMemberLayout';
import Dashboard from './pages/teamMember/Dashboard';
// @ts-ignore: default export may not be detected correctly by TS in this workspace
import MemberTasks from './pages/teamMember/Tasks.tsx';
import MemberProgress from './pages/teamMember/Progress';
import MemberProfile from './pages/teamMember/Profile';
import TeamProjects from './pages/teamMember/Projects';
import Team from './pages/teamMember/Team';
import MemberProjectDetails from './pages/teamMember/ProjectDetails';
import MemberTaskDetails from './pages/teamMember/TaskDetails';
import { normalizeRole } from './utils/auth';

/** Redirect unauthenticated users to /login */
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
    children,
    allowedRoles,
}) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const role = normalizeRole(user?.role);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role)) {
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'manager') return <Navigate to="/manager" replace />;
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
                <Route path="activities" element={<ActivityLogPage />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<MemberProfile />} />
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
                {/* 👇 New route for project details */}
                <Route path="projects/:id" element={<ProjectDetails />} />
                <Route path="projects/edit/:id" element={<EditProject />} />
                <Route path="tasks" element={<ManagerTasks />} />
                <Route path="tasks/:id" element={<TaskDetails />} />
                <Route path="reports" element={<ManagerReports />} />
                <Route path="activities" element={<ActivityLogPage />} />
                <Route path="settings" element={<ManagerSettings />} />
                <Route path="profile" element={<MemberProfile />} />
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
                <Route path="tasks/:id" element={<MemberTaskDetails />} />
                <Route path="projects" element={<TeamProjects />} />
                <Route path="projects/:id" element={<MemberProjectDetails />} />
                <Route path="team" element={<Team />} />
                <Route path="progress" element={<MemberProgress />} />
                <Route path="profile" element={<MemberProfile />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};