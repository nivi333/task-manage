import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { adminService, AdminStatsDTO } from '../../services/adminService';

const SystemStats: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spin />;
  if (!stats) return <div>No stats available.</div>;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card><Statistic title="Users" value={stats.users} /></Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card><Statistic title="Projects" value={stats.projects} /></Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card><Statistic title="Tasks" value={stats.tasks} /></Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card><Statistic title="Teams" value={stats.teams} /></Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card><Statistic title="Comments" value={stats.comments} /></Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card><Statistic title="Notifications" value={stats.notifications} /></Card>
      </Col>
    </Row>
  );
};

export default SystemStats;
