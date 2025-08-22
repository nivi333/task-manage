import React from 'react';
import { Card, Typography } from 'antd';
import { Task } from '../../types/task';

const { Text } = Typography;

const TaskDescription: React.FC<{ task: Task }> = ({ task }) => (
  <Card
    title={<Text strong>Description</Text>}
    style={{ marginBottom: 12, background: '#fff' }}
    headStyle={{ borderBottom: 'none', padding: '8px 12px', background: '#fff' }}
    bodyStyle={{ padding: 12, background: '#fff' }}
  >
    <div style={{ whiteSpace: 'pre-line' }}>
      {task.description || 'No description provided.'}
    </div>
  </Card>
);

export default TaskDescription;
