import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { ProjectMetrics } from '../../types/project';

interface Props {
  metrics: ProjectMetrics;
}

const ProjectStats: React.FC<Props> = ({ metrics }) => {
  const items = [
    { title: 'Total Tasks', value: metrics.totalTasks, color: '#1677ff' },
    { title: 'Open', value: metrics.openTasks, color: '#faad14' },
    { title: 'In Progress', value: metrics.inProgressTasks, color: '#722ed1' },
    { title: 'Done', value: metrics.doneTasks, color: '#52c41a' },
    { title: 'Overdue', value: metrics.overdueTasks, color: '#ff4d4f' },
    { title: 'Completion %', value: Math.round(metrics.completionPercent), color: '#13c2c2', suffix: '%' },
  ];

  return (
    <Row className="tt-project-stats" gutter={[12, 12]}>
      {items.map((k) => (
        <Col key={k.title} xs={12} sm={8} md={8} lg={4}>
          <Card className="tt-stat-card" bordered>
            <Statistic title={k.title} value={k.value} suffix={k.suffix} valueStyle={{ color: k.color }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProjectStats;
