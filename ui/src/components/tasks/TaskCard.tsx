import React from 'react';
import { Card, Tag, Avatar } from 'antd';
import { UserOutlined, BookOutlined, BugOutlined, CaretUpOutlined } from '@ant-design/icons';
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
  const assigneeName = (() => {
    const fn = task.assignedTo?.firstName ?? '';
    const ln = task.assignedTo?.lastName ?? '';
    const full = `${fn} ${ln}`.trim();
    return full || 'Unassigned';
  })();

  const initials = (() => {
    if (task.assignedTo) {
      const f = task.assignedTo.firstName?.charAt(0) ?? '';
      const l = task.assignedTo.lastName?.charAt(0) ?? '';
      return (f + l).toUpperCase() || 'UN';
    }
    return 'UN';
  })();

  const tags = task.tags || [];
  const primaryLabel = tags.length > 0 ? String(tags[0]).toUpperCase() : undefined;
  const otherTags = tags.slice(1);

  const isBug = tags.map(t => String(t).toUpperCase()).includes('BUG') || task.priority === 'HIGH';
  const issueCode = `TASK-${(task.id || '').slice(-5).toUpperCase()}`;

  return (
    <Card className={`task-card modern priority-${task.priority.toLowerCase()}`} hoverable>
      <div className="title-block">
        <div className="title" title={task.title}>{task.title}</div>
      </div>

      {primaryLabel && (
        <div className="pills">
          <span className="pill primary">{primaryLabel}</span>
        </div>
      )}

      {otherTags.length > 0 && (
        <div className="chips">
          {otherTags.map(tag => (
            <span key={tag} className="chip">{String(tag).toUpperCase()}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="left-meta">
          <span className={`issue-icon ${isBug ? 'bug' : 'feature'}`}>
            {isBug ? <BugOutlined /> : <BookOutlined />}
          </span>
          <span className="issue-code">{issueCode}</span>
        </div>
        <div className="right-meta">
          <span className={`priority ${task.priority.toLowerCase()}`}>
            <CaretUpOutlined />
          </span>
          {task.assignedTo ? (
            <Avatar size={28} src={task.assignedTo.profilePicture} />
          ) : (
            <Avatar size={28} className="assignee-initials">{initials}</Avatar>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
