import React, { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UserManagementPage from "./pages/UserManagementPage";
import TasksListPage from "./pages/TasksListPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import TasksBoardPage from "./pages/TasksBoardPage";
import TasksStatsPage from "./pages/TasksStatsPage";
import TasksPage from "./pages/TasksPage";
import UserProfilePage from "./pages/UserProfilePage";
import TermsPage from "./pages/TermsPage";
import ProjectsListPage from "./pages/ProjectsListPage";
import TeamSettingsPage from "./pages/TeamSettingsPage";
import ProjectTeamPage from "./pages/ProjectTeamPage";
import TeamListPage from "./pages/TeamListPage";
import DashboardPage from "./pages/DashboardPage";
import NotificationCenterPage from "./pages/NotificationCenterPage";
import GlobalSearchPage from "./pages/GlobalSearchPage";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { authAPI } from "./services/authService";
import {
  initNotificationService,
  notificationService,
} from "./services/notificationService";
import "./App.css";
import "./styles/global.css";
import "./styles/components/auth.css";
import "./styles/components/forms.css";
import "./styles/components/admin.css";
import "./styles/components/user.css";
import { colors } from "./styles/colors";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import CreateTaskPage from "./pages/CreateTaskPage";

// Theme configuration builder (light/dark)
const buildTheme = (isDark: boolean) => {
  return {
    algorithm: [isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm],
    token: {
      colorPrimary: colors.primary,
      borderRadius: 8,
    },
  } as const;
};

// Protected Route component

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const isAuthenticated = authAPI.isAuthenticated();
  const userRoles = authAPI.getUserRoles();

  console.log(
    "[DEBUG] ProtectedRoute - isAuthenticated:",
    isAuthenticated,
    "userRoles:",
    userRoles,
    "allowedRoles:",
    allowedRoles
  );

  if (!isAuthenticated) {
    console.log("[DEBUG] Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some((role) => userRoles.includes(role))) {
    console.log("[DEBUG] Role check failed, redirecting to dashboard");
    notificationService.error(
      "You do not have permission to view this page. Redirected to Dashboard."
    );
    return <Navigate to="/dashboard" replace />;
  }

  console.log("[DEBUG] ProtectedRoute - Access granted");
  return <>{children}</>;
};

// Admin Route component (checks roles via robust parser)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const roles = authAPI.getUserRoles();
  if (roles.includes("ADMIN")) {
    return <>{children}</>;
  }
  return <Navigate to="/dashboard" replace />;
};

// Inner App component that uses the App context
const AppContent: React.FC = () => {
  const { isDark } = useTheme();
  const { message } = AntdApp.useApp();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    // Initialize the notification service with the message API from App context (once)
    initNotificationService(message);
    initializedRef.current = true;
    console.log("[NOTIFICATION] Service initialized with App context");
  }, [message]);

  const themeCfg = buildTheme(isDark);

  return (
    <ConfigProvider theme={themeCfg as any}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/terms" element={<TermsPage />} />

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
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
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
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <UserManagementPage />
                </ProtectedRoute>
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
    <ThemeProvider>
      <AntdApp>
        <AppContent />
      </AntdApp>
    </ThemeProvider>
  );
}

export default App;
