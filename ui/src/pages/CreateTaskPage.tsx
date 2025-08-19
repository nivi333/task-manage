import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/tasks?create=1', { replace: true });
  }, [navigate]);
  return null;
};

export default CreateTaskPage;
