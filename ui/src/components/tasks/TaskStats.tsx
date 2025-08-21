import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { Task } from '../../types/task';

interface TaskStatsProps {
  tasks: Task[];
}

const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const openTasks = tasks.filter(t => t.status === 'OPEN').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;

  const highPriority = tasks.filter(t => t.priority === 'HIGH').length;
  const mediumPriority = tasks.filter(t => t.priority === 'MEDIUM').length;
  const lowPriority = tasks.filter(t => t.priority === 'LOW').length;

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Tasks" value={totalTasks} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Open" value={openTasks} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="In Progress" value={inProgressTasks} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Done" value={doneTasks} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={8}>
          <Card>
            <Statistic title="High Priority" value={highPriority} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Medium Priority" value={mediumPriority} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Low Priority" value={lowPriority} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TaskStats;
