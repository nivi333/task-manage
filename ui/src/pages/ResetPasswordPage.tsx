import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import AuthLayout from '../components/auth/AuthLayout';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import SuccessMessage from '../components/auth/SuccessMessage';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const resetToken = searchParams.get('token');
    
    if (!resetToken) {
      message.error('Invalid reset link. Please request a new password reset.');
      navigate('/forgot-password');
      return;
    }

    setToken(resetToken);
  }, [searchParams, navigate]);

  const handleResetPasswordSuccess = () => {
    setShowSuccess(true);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthLayout
      imageTitle="Reset Password"
      imageSubtitle="Create a new secure password for your account."
    >
      {showSuccess ? (
        <SuccessMessage
          type="reset-password"
          onBackToLogin={handleBackToLogin}
          autoRedirect={true}
          redirectDelay={5}
        />
      ) : (
        <ResetPasswordForm
          token={token}
          onSuccess={handleResetPasswordSuccess}
          onBackToLogin={handleBackToLogin}
        />
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
