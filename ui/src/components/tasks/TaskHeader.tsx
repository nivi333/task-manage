import React from 'react';
import { Card, Tag } from 'antd';
import UserAvatar from '../common/UserAvatar';
import { Task } from '../../types/task';

const TaskHeader: React.FC<{ task: Task }> = ({ task }) => (
  <Card style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <h2>{task.title}</h2>
        <Tag color={task.status === 'DONE' ? 'green' : task.status === 'IN_PROGRESS' ? 'blue' : 'orange'}>
          {task.status}
        </Tag>
        <Tag color={task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'gold' : 'default'}>
          {task.priority}
        </Tag>
      </div>
      <div>
        {task.assignedTo ? (
          <UserAvatar user={task.assignedTo} size={32} style={{ marginRight: 8 }} />
        ) : (
          <UserAvatar user={null} size={32} style={{ marginRight: 8 }} />
        )}
        <span>{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}</span>
      </div>
    </div>
  </Card>
);

export default TaskHeader;
