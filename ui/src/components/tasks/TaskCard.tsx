import React from 'react';
import { Card, Tag, Typography } from 'antd';
import { Task } from '../../types/task';
import dayjs from 'dayjs';
import './TaskCard.css';

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
    <Card size="small" hoverable className="task-card">
      <div className="task-card-header">
        <span className="task-card-title">{task.title}</span>
        {task.priority && (
          <Tag color={priorityColor[task.priority] || 'default'} className="task-card-badge">
            {task.priority}
          </Tag>
        )}
        <div className="task-card-due">
          <Text type="secondary">
            {task.dueDate ? `Due: ${dayjs(task.dueDate).format('MMM D, YYYY')}` : 'No due date'}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
