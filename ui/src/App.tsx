import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, Button, Space, Typography, Card } from 'antd';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UserManagementPage from './pages/UserManagementPage';
import TasksListPage from './pages/TasksListPage';
import TasksBoardPage from './pages/TasksBoardPage';
import TaskDetailPage from './pages/TaskDetailPage';
import CreateTaskPage from './pages/CreateTaskPage';
import EditTaskPage from './pages/EditTaskPage';
import TasksStatsPage from './pages/TasksStatsPage';
import UserProfilePage from './pages/UserProfilePage';
import DashboardPage from './pages/DashboardPage';
import { authAPI } from './services/authService';
import { initNotificationService } from './services/notificationService';
import './App.css';
import './styles/global.css';
import './styles/components/auth.css';
import './styles/components/forms.css';
import './styles/components/admin.css';
import { colors } from './styles/colors';

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
  },
};

// Temporary Dashboard component with navigation shortcuts
const Dashboard: React.FC = () => (
  <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
    <Card style={{ maxWidth: 720, width: '100%', textAlign: 'center' }}>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>Welcome to Task Management Dashboard</Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Choose a section below to get started.
      </Typography.Paragraph>
      <Space size={[12, 12]} wrap>
        <Link to="/tasks"><Button type="primary">View Task List</Button></Link>
        <Link to="/tasks/board"><Button>Open Kanban Board</Button></Link>
        <Link to="/tasks/stats"><Button>View Task Statistics</Button></Link>
        <Link to="/profile"><Button>My Profile</Button></Link>
        <Button danger onClick={() => { authAPI.logout(); window.location.href = '/login'; }}>Logout</Button>
      </Space>
    </Card>
  </div>
);

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Route component (checks JWT roles in localStorage token)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
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

  useEffect(() => {
    // Initialize the notification service with the message API from App context
    initNotificationService(message);
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TasksListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/board"
              element={
                <ProtectedRoute>
                  <TasksBoardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/stats"
              element={
                <ProtectedRoute>
                  <TasksStatsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/new"
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
              path="/tasks/:id/edit"
              element={
                <ProtectedRoute>
                  <EditTaskPage />
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
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
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
