import React, { useEffect, useState } from 'react';
import { Layout, Spin, Typography } from 'antd';
import taskService from '../services/taskService';
import { Task } from '../types/task';
import TaskBoard from '../components/tasks/TaskBoard';

const { Content } = Layout;
const { Title } = Typography;

const TasksBoardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const fetchedTasks = await taskService.getTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        // Error handling is in the service
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2}>Task Board</Title>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <TaskBoard tasks={tasks} />
        )}
      </Content>
    </Layout>
  );
};

export default TasksBoardPage;
