import React, { useCallback, useEffect, useState } from 'react';
import { Card } from 'antd';
import { Task } from '../types/task';
import { taskService } from '../services/taskService';
import TaskBoard, { BoardStatus } from '../components/tasks/TaskBoard';
import { notificationService } from '../services/notificationService';
import AppLayout from '../components/layout/AppLayout';

const TasksBoardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const page = await taskService.list({ size: 100, sortBy: 'updatedAt', sortDir: 'desc' });
      setTasks(page.content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleChange = async (id: string, status: BoardStatus) => {
    try {
      const updated = await taskService.update(id, { status });
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: updated.status } : t)));
      notificationService.success('Status updated');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update status';
      notificationService.error(msg);
    }
  };

  return (
    <AppLayout title="Kanban Board" contentPadding={24}>
      <Card loading={loading}>
        <TaskBoard tasks={tasks} onStatusChange={handleChange} />
      </Card>
    </AppLayout>
  );
};

export default TasksBoardPage;
