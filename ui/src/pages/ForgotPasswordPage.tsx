import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import SuccessMessage from '../components/auth/SuccessMessage';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleForgotPasswordSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setShowSuccess(true);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <AuthLayout
      imageTitle="Forgot Password"
      imageSubtitle="Don't worry, we'll help you get back into your account securely."
    >
      {showSuccess ? (
        <SuccessMessage
          type="forgot-password"
          email={email}
          onBackToLogin={handleBackToLogin}
          autoRedirect={true}
          redirectDelay={10}
        />
      ) : (
        <ForgotPasswordForm
          onSuccess={handleForgotPasswordSuccess}
          onBackToLogin={handleBackToLogin}
        />
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
