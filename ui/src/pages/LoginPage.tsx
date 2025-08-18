import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

import AuthLayout from '../components/auth/AuthLayout';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (user: any) => {
    console.log('Login successful:', user);
    const roles: string[] = user?.roles || [];
    if (roles.includes('ADMIN')) {
      navigate('/admin/users');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout
      imageUrl={require('../assets/login-illustration.png')}
      imageTitle="Login"
      imageSubtitle="Sign in to manage your tasks, collaborate, and boost productivity."
    >
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </AuthLayout>
  );
};

export default LoginPage;
