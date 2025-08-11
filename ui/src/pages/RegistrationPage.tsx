import React from 'react';
import RegistrationForm from '../components/auth/RegistrationForm';

import AuthLayout from '../components/auth/AuthLayout';

const RegistrationPage: React.FC = () => {
  return (
    <AuthLayout
      imageUrl={require('../assets/login-illustration.png')}
      imageTitle="Create Account"
      imageSubtitle="Join our platform to manage your tasks, collaborate, and achieve more."
    >
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegistrationPage;
