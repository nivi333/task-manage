import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import { authAPI } from './services/authService';
import { initNotificationService } from './services/notificationService';
import './App.css';
import { colors } from './styles/colors';

// Theme configuration for Ant Design
const theme = {
  token: {
    colorPrimary: colors.primary,
    colorSecondary: colors.secondary,
    colorBgContainer: colors.background,
    colorAccent: colors.accent,
    borderRadius: 8,
  },
};

// Temporary Dashboard component (will be replaced with actual dashboard)
const Dashboard: React.FC = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Welcome to Task Management Dashboard!</h1>
    <p>Login successful. Dashboard implementation coming soon...</p>
    <button onClick={() => {
      authAPI.logout();
      window.location.href = '/login';
    }}>
      Logout
    </button>
  </div>
);

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
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
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
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
