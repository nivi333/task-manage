import React, { useEffect, useState } from 'react';
import { Card, Skeleton } from 'antd';
import TaskForm from '../components/tasks/TaskForm';
import { useNavigate, useParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { Task } from '../types/task';
import { notificationService } from '../services/notificationService';
import AppLayout from '../components/layout/AppLayout';

const EditTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        const t = await taskService.get(id);
        setTask(t);
      } catch (e: any) {
        const msg = e?.response?.data?.message || 'Failed to load task';
        notificationService.error(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  return (
    <AppLayout title="Edit Task" contentPadding={24}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Card>
          {loading ? (
            <Skeleton active />
          ) : task ? (
            <TaskForm
              mode="edit"
              initialTask={task}
              onSubmit={(t) => navigate(`/tasks/${t.id}`)}
            />
          ) : null}
        </Card>
      </div>
    </AppLayout>
  );
};

export default EditTaskPage;
