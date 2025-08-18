import React from 'react';
import { Card, Typography } from 'antd';
import { Task } from '../../types/task';
import TaskCard from './TaskCard';

const { Title } = Typography;

export type BoardStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

const columns: { key: BoardStatus; title: string }[] = [
  { key: 'OPEN', title: 'To Do' },
  { key: 'IN_PROGRESS', title: 'In Progress' },
  { key: 'DONE', title: 'Done' },
];

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (id: string, status: BoardStatus) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onStatusChange }) => {
  const grouped: Record<BoardStatus, Task[]> = {
    OPEN: [],
    IN_PROGRESS: [],
    DONE: [],
  };
  for (const t of tasks) {
    const key = (t.status as BoardStatus) || 'OPEN';
    if (grouped[key]) grouped[key].push(t);
    else grouped.OPEN.push(t);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      {columns.map(col => (
        <Card key={col.key} title={<Title level={4} style={{ margin: 0 }}>{col.title}</Title>}>
          <div
            id={col.key}
            style={{ minHeight: 200, background: '#fafafa', padding: 8, borderRadius: 8 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const draggedId = e.dataTransfer.getData('text/plain');
              if (draggedId) onStatusChange(draggedId, col.key);
            }}
          >
            {grouped[col.key].map(t => (
              <div
                key={t.id}
                id={String(t.id)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', String(t.id));
                }}
              >
                <TaskCard task={t} />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TaskBoard;
