import React from 'react';
import { List } from 'antd';
import { Task } from '../../types/task';
import TaskCard from './TaskCard';
import '../../styles/components/TaskList.css';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId?: string;
  onSelect: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, selectedTaskId, onSelect }) => {
  return (
    <List
      dataSource={tasks}
      renderItem={task => (
        <List.Item
          key={task.id}
          className="task-list-item"
          onClick={() => onSelect(task.id)}
        >
          <div
            className={`task-list-item-content ${task.id === selectedTaskId ? 'selected' : ''}`}
          >
            <span className="task-list-title">{task.title}</span>
            <span className="task-list-project">{task.project?.name || '—'}</span>
            <span className="task-list-priority-badge">
              {task.priority}
            </span>
          </div>
        </List.Item>
      )}
      className="task-list-container"
    />
  );
};

export default TaskList;
