import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { Task } from '../../types/task';
import TaskCard from './TaskCard';
import './TaskBoard.css';

const { Title } = Typography;

interface TaskBoardProps {
  tasks: Task[];
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
  const columns = {
    OPEN: tasks.filter(task => task.status === 'OPEN'),
    IN_PROGRESS: tasks.filter(task => task.status === 'IN_PROGRESS'),
    DONE: tasks.filter(task => task.status === 'DONE'),
  };

  return (
    <Row gutter={16}>
      <Col span={8}>
        <Card title="Open" className="task-board-column">
          {columns.OPEN.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Card>
      </Col>
      <Col span={8}>
        <Card title="In Progress" className="task-board-column">
          {columns.IN_PROGRESS.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Card>
      </Col>
      <Col span={8}>
        <Card title="Done" className="task-board-column">
          {columns.DONE.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Card>
      </Col>
    </Row>
  );
};

export default TaskBoard;
