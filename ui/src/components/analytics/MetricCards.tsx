import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { AnalyticsSummary } from '../../types/analytics';

interface MetricCardsProps {
  summary?: AnalyticsSummary;
  loading?: boolean;
}

const MetricCards: React.FC<MetricCardsProps> = ({ summary, loading }) => {
  return (
    <Row gutter={16}>
      <Col xs={12} md={6}>
        <Card loading={loading}>
          <Statistic title="Tasks Completed" value={summary?.totalTasksCompleted ?? 0} />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card loading={loading}>
          <Statistic title="Avg Cycle Time (days)" value={summary?.avgCycleTimeDays ?? 0} precision={1} />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card loading={loading}>
          <Statistic title="Active Projects" value={summary?.activeProjects ?? 0} />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card loading={loading}>
          <Statistic title="Open Tasks" value={summary?.openTasks ?? 0} />
        </Card>
      </Col>
    </Row>
  );
};

export default MetricCards;
