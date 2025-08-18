import React from 'react';
import { Card, Typography } from 'antd';
import TaskForm from '../components/tasks/TaskForm';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
      <Title level={3}>Create Task</Title>
      <Card>
        <TaskForm
          mode="create"
          onSubmit={(task) => navigate(`/tasks/${task.id}`)}
        />
      </Card>
    </div>
  );
};

export default CreateTaskPage;
