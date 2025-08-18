import React from 'react';
import { Card, Tag, Typography } from 'antd';
import { Task } from '../../types/task';
import dayjs from 'dayjs';

const { Text } = Typography;

const priorityColor: Record<string, string> = {
  HIGH: 'red',
  MEDIUM: 'gold',
  LOW: 'blue',
};

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <Card size="small" hoverable style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600 }}>{task.title}</div>
        {task.priority && <Tag color={priorityColor[task.priority] || 'default'}>{task.priority}</Tag>}
      </div>
      <div style={{ marginTop: 4 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {task.dueDate ? `Due: ${dayjs(task.dueDate).format('MMM D, YYYY')}` : 'No due date'}
        </Text>
      </div>
    </Card>
  );
};

export default TaskCard;
