import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import taskService from '../services/taskService';
import { Task } from '../types/task';
import TaskStats from '../components/tasks/TaskStats';

const TasksStatsPage: React.FC = () => {
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
    <div>
      {loading ? (
        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <TaskStats tasks={tasks} />
      )}
    </div>
  );
};

export default TasksStatsPage;
