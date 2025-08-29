import React, { useCallback, useEffect, useState } from 'react';
import { Button, Spin, Typography } from 'antd';
import taskService from '../services/taskService';
import { Task } from '../types/task';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskFormDrawer from '../components/tasks/TaskFormDrawer';
import { projectService } from '../services/projectService';

const TasksBoardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [projectMap, setProjectMap] = useState<Record<string, { key?: string; name: string }>>({});

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      // Error handling is in the service
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await projectService.list();
        const map: Record<string, { key?: string; name: string }> = {};
        projects.forEach(p => { map[p.id] = { key: p.key, name: p.name }; });
        setProjectMap(map);
      } catch (e) {
        // handled globally
      }
    };
    loadProjects();
  }, []);

  const handleMove = async (taskId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DONE') => {
    // Optimistic update
    const prevTasks = tasks;
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } as Task : t)));
    try {
      // Explicitly send only the required payload for DnD moves
      await taskService.moveTaskStatus(taskId, newStatus);
    } catch (e) {
      // rollback on failure
      setTasks(prevTasks);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0, alignSelf: 'flex-start' }}>Kanban</Typography.Title>
        <Button type="primary" onClick={() => setCreateOpen(true)}>Create Task</Button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <TaskBoard tasks={tasks} onMove={handleMove} projectMap={projectMap} />
      )}

      <TaskFormDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onTaskSaved={fetchTasks}
      />
    </div>
  );
};

export default TasksBoardPage;
