import React from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { TeamStatsSummary } from '../../types/team';

interface Props {
  stats: TeamStatsSummary;
}

const StatCard: React.FC<{ title: string; value: number }> = ({ title, value }) => (
  <Card className="card">
    <Statistic title={title} value={value} />
  </Card>
);

const TeamStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="card p-md">
      <Typography.Title level={5} className="mb-sm">Team Performance</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}><StatCard title="Members" value={stats.totalMembers} /></Col>
        <Col xs={12} md={6}><StatCard title="Active Projects" value={stats.activeProjects} /></Col>
        <Col xs={12} md={6}><StatCard title="Open" value={stats.tasksOpen} /></Col>
        <Col xs={12} md={6}><StatCard title="In Progress" value={stats.tasksInProgress} /></Col>
        <Col xs={12} md={6}><StatCard title="Done" value={stats.tasksDone} /></Col>
      </Row>
    </div>
  );
};

export default TeamStats;
