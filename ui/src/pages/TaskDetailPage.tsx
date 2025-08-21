import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Spin, message } from 'antd';
import taskService from 'services/taskService';
import { Task } from 'types/task';
import TaskHeader from 'components/tasks/TaskHeader';
import TaskDescription from 'components/tasks/TaskDescription';
import CommentSection from 'components/tasks/CommentSection';
import ActivityTimeline from 'components/tasks/ActivityTimeline';
import TimeTracker from 'components/tasks/TimeTracker';
import FileAttachmentViewer from 'components/tasks/FileAttachmentViewer';
import DependencyVisualization from 'components/tasks/DependencyVisualization';
import SubtaskManagement from 'components/tasks/SubtaskManagement';

const { Content } = Layout;

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    taskService.getTaskById(id!)
      .then(setTask)
      .catch((err: any) => {
        setError('Failed to load task details');
        message.error('Failed to load task details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }
  if (error || !task) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}>{error || 'Task not found.'}</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
        <TaskHeader task={task} />
        <TaskDescription task={task} />
        <FileAttachmentViewer attachments={task.attachments || []} />
        <DependencyVisualization dependencies={task.dependencies || []} />
        <SubtaskManagement subtasks={task.subtasks || []} parentTaskId={task.id} />
        <TimeTracker taskId={task.id} />
        <ActivityTimeline taskId={task.id} />
        <CommentSection taskId={task.id} />
      </Content>
    </Layout>
  );
};

export default TaskDetailPage;
