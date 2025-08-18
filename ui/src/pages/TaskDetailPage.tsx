import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Space, Tag, Typography, Spin } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { Task } from '../types/task';
import { taskService } from '../services/taskService';
import Button from '../components/common/Button';

const { Title, Paragraph, Text } = Typography;

const TaskDetailPage: React.FC = () => {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const t = await taskService.get(id);
        setTask(t);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}><Spin /></div>;
  if (!task) return <div style={{ padding: 24 }}>Task not found.</div>;

  return (
    <div style={{ padding: 24 }}>
      <Space align="center" style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
        <Title level={2} style={{ margin: 0 }}>{task.title}</Title>
        <Space>
          <Link to="/tasks"><Button>Back to Tasks</Button></Link>
        </Space>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered size="middle" column={2}>
          <Descriptions.Item label="Status" span={1}>
            {task.status ? <Tag color={task.status === 'DONE' ? 'green' : task.status === 'IN_PROGRESS' ? 'blue' : 'default'}>{task.status}</Tag> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Priority" span={1}>{task.priority || '-'}</Descriptions.Item>
          <Descriptions.Item label="Due Date" span={1}>{task.dueDate ? new Date(task.dueDate).toLocaleString() : '-'}</Descriptions.Item>
          <Descriptions.Item label="Estimated Hours" span={1}>{task.estimatedHours ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Actual Hours" span={1}>{task.actualHours ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Tags" span={1}>
            {task.tags?.length ? task.tags.map(t => <Tag key={t}>{t}</Tag>) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At" span={1}>{task.createdAt ? new Date(task.createdAt).toLocaleString() : '-'}</Descriptions.Item>
          <Descriptions.Item label="Updated At" span={1}>{task.updatedAt ? new Date(task.updatedAt).toLocaleString() : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Description">
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{task.description || <Text type="secondary">No description</Text>}</Paragraph>
      </Card>

      <div style={{ height: 16 }} />

      <Card title="Comments" extra={<Text type="secondary">Placeholder</Text>}>
        {/* TODO: wire to Comment APIs */}
        <Text type="secondary">Comments UI coming soon.</Text>
      </Card>
    </div>
  );
};

export default TaskDetailPage;
