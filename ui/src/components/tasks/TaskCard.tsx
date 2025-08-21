import React from 'react';
import { Card, Tag, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Task } from '../../types/task';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
}

const getPriorityColor = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
  switch (priority) {
    case 'HIGH': return 'red';
    case 'MEDIUM': return 'orange';
    case 'LOW': return 'green';
    default: return 'default';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <Card className="task-card" hoverable>
      <div className="task-card-header">
        <span className="task-card-title">{task.title}</span>
      </div>
      <div className="task-card-body">
        <p>{task.description}</p>
      </div>
      <div className="task-card-footer">
        <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>
        <div className="task-card-assignee">
          {task.assignedTo ? (
            <Avatar size="small" src={task.assignedTo.profilePicture} />
          ) : (
            <Avatar size="small" icon={<UserOutlined />} />
          )}
          <span>{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}</span>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
