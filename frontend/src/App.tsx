import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceLayout from '@/components/layout/WorkspaceLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import DrivePage from '@/pages/DrivePage';
import DocsPage from '@/pages/DocsPage';
import SheetsPage from '@/pages/SheetsPage';
import SlidesPage from '@/pages/SlidesPage';
import FormsPage from '@/pages/FormsPage';
import ChatPage from '@/pages/ChatPage';

import SettingsPage from '@/pages/SettingsPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ExpensesPage from '@/pages/ExpensesPage';
import CalendarPage from '@/pages/CalendarPage';
import PublicSignPage from '@/pages/PublicSignPage';
import CustomerPortalPage from '@/pages/CustomerPortalPage';
import BackupPage from '@/pages/BackupPage';
import SystemDashboard from '@/pages/SystemDashboard';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/50 font-medium animate-pulse">Chargement de Desksuite...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes Client */}
      <Route path="/sign/:id" element={<PublicSignPage />} />
      <Route path="/portal/:token" element={<CustomerPortalPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main App (Protected) */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <WorkspaceLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="drive" element={<DrivePage />} />
        <Route path="docs" element={<DocsPage />} />
        <Route path="sheets" element={<SheetsPage />} />
        <Route path="slides" element={<SlidesPage />} />
        <Route path="forms" element={<FormsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="backups" element={<BackupPage />} />
        <Route path="system" element={<SystemDashboard />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
