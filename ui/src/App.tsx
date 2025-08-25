import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UserManagementPage from './pages/UserManagementPage';
import TasksListPage from './pages/TasksListPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TasksBoardPage from './pages/TasksBoardPage';
import TasksStatsPage from './pages/TasksStatsPage';
import TasksPage from './pages/TasksPage';
import UserProfilePage from './pages/UserProfilePage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import TeamSettingsPage from './pages/TeamSettingsPage';
import ProjectTeamPage from './pages/ProjectTeamPage';
import TeamListPage from './pages/TeamListPage';
import DashboardPage from './pages/DashboardPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import GlobalSearchPage from './pages/GlobalSearchPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import SettingsPage from './pages/SettingsPage';
import { authAPI } from './services/authService';
import { initNotificationService, notificationService } from './services/notificationService';
import './App.css';
import './styles/global.css';
import './styles/components/auth.css';
import './styles/components/forms.css';
import './styles/components/admin.css';
import { colors } from './styles/colors';
import CreateTaskPage from './pages/CreateTaskPage';

// Theme configuration for Ant Design
const theme = {
  token: {
    colorPrimary: colors.primary,
    colorSecondary: colors.secondary,
    colorBgContainer: colors.background,
    colorAccent: colors.accent,
    borderRadius: 8,
    // Input field styling
    colorBgBase: '#ffffff',
    colorBgElevated: '#ffffff',
    colorFillAlter: '#ffffff',
    colorFillSecondary: '#fafafa',
    colorFillTertiary: '#f5f5f5',
    colorFillQuaternary: '#f0f0f0',
  },
  components: {
    Input: {
      colorBgContainer: '#ffffff',
      colorBorder: '#d9d9d9',
      colorBorderHover: '#4096ff',
      colorBgContainerDisabled: '#f5f5f5',
    },
    Select: {
      colorBgContainer: '#ffffff',
      colorBorder: '#d9d9d9',
      colorBorderHover: '#4096ff',
    },
    DatePicker: {
      colorBgContainer: '#ffffff',
      colorBorder: '#d9d9d9',
      colorBorderHover: '#4096ff',
    },
    TextArea: {
      colorBgContainer: '#ffffff',
      colorBorder: '#d9d9d9',
      colorBorderHover: '#4096ff',
    },
    // Ensure cards are pure white with a slightly darker border for clear separation
    Card: {
      colorBgContainer: '#ffffff',
      // slightly darker than default grey to differentiate from page background
      colorBorderSecondary: '#d0d5dd',
    },
  },
};

// Protected Route component

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  const userRoles = authAPI.getUserRoles();

  console.log('[DEBUG] ProtectedRoute - isAuthenticated:', isAuthenticated, 'userRoles:', userRoles, 'allowedRoles:', allowedRoles);

  if (!isAuthenticated) {
    console.log('[DEBUG] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => userRoles.includes(role))) {
    console.log('[DEBUG] Role check failed, redirecting to dashboard');
    notificationService.error('You do not have permission to view this page. Redirected to Dashboard.');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[DEBUG] ProtectedRoute - Access granted');
  return <>{children}</>;
};

// Admin Route component (checks JWT roles in localStorage token)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Try to read roles from JWT payload
  const token = authAPI.getToken();
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      const roles: string[] = payload?.roles || [];
      if (roles.includes('ADMIN')) {
        return <>{children}</>;
      }
    }
  } catch (e) {
    // Fallback to deny access
  }
  return <Navigate to="/dashboard" replace />;
};

// Inner App component that uses the App context
const AppContent: React.FC = () => {
  const { message } = AntdApp.useApp();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    // Initialize the notification service with the message API from App context (once)
    initNotificationService(message);
    initializedRef.current = true;
    console.log('[NOTIFICATION] Service initialized with App context');
  }, [message]);

  return (
    <ConfigProvider theme={theme}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationCenterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <GlobalSearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/dashboard"
              element={
                <ProtectedRoute>
                  <ProjectDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/team"
              element={
                <ProtectedRoute>
                  <ProjectTeamPage />
                </ProtectedRoute>
              }
            />
                        <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <TeamListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams/:id/settings"
              element={
                <ProtectedRoute>
                  <TeamSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            {/* Tasks section with left-side sub menu */}
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<TasksListPage />} />
              <Route path="board" element={<TasksBoardPage />} />
              <Route path="stats" element={<TasksStatsPage />} />
            </Route>
            {/* Create Task route must exist so 'create' isn't treated as an ID */}
            <Route
              path="/tasks/create"
              element={
                <ProtectedRoute>
                  <CreateTaskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <ProtectedRoute>
                  <TaskDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserManagementPage />
                </AdminRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

function App() {
  return (
    <AntdApp>
      <AppContent />
    </AntdApp>
  );
}

export default App;
