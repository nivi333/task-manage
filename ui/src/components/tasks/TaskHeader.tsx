import React from 'react';
import { Card, Tag, Avatar } from 'antd';
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
          <Avatar src={task.assignedTo.profilePicture} style={{ marginRight: 8 }} />
        ) : (
          <Avatar icon={null} style={{ marginRight: 8 }} />
        )}
        <span>{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}</span>
      </div>
    </div>
  </Card>
);

export default TaskHeader;
