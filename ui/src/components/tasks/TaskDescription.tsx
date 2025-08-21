import React from 'react';
import { Card } from 'antd';
import { Task } from '../../types/task';

const TaskDescription: React.FC<{ task: Task }> = ({ task }) => (
  <Card title="Description" style={{ marginBottom: 16 }}>
    <div style={{ whiteSpace: 'pre-line' }}>{task.description || 'No description provided.'}</div>
  </Card>
);

export default TaskDescription;
