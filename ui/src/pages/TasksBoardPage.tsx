import React, { useCallback, useEffect, useState } from 'react';
import { Card } from 'antd';
import { Task } from '../types/task';
import { taskService } from '../services/taskService';
import TaskBoard, { BoardStatus } from '../components/tasks/TaskBoard';
import { notificationService } from '../services/notificationService';
import AppLayout from '../components/layout/AppLayout';
import { HeaderTitle } from '../components/common';

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
      // Find the original task to get assignedTo
      const original = tasks.find(t => t.id === id);
      const assignedTo = original?.assignedTo;
      const payload: any = { status };
      // Only include assignedTo if present (backend requires it)
      if (assignedTo) payload.assignedTo = assignedTo;
      const updated = await taskService.update(id, payload);
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: updated.status } : t)));
      notificationService.success('Status updated');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update status';
      notificationService.error(msg);
    }
  };


  return (
    <AppLayout title={<HeaderTitle level={3}>Kanban Board</HeaderTitle>} contentPadding={24}>
      <Card loading={loading}>
        <TaskBoard tasks={tasks} onStatusChange={handleChange} />
      </Card>
    </AppLayout>
  );
};

export default TasksBoardPage;
