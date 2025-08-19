import React from 'react';
import { Typography, Space, Row, Col, Card, Statistic } from 'antd';
import { FundOutlined, BarChartOutlined } from '@ant-design/icons';
import { Pie, Column } from '@ant-design/plots';
import AppLayout from '../components/layout/AppLayout';

const { Text } = Typography;

const DashboardPage: React.FC = () => {

  // Sample KPI data (replace with real counts if desired)
  const kpis = [
    { title: 'Total Tasks', value: 128, color: '#1677ff' },
    { title: 'In Progress', value: 42, color: '#faad14' },
    { title: 'Completed', value: 58, color: '#52c41a' },
    { title: 'Overdue', value: 12, color: '#ff4d4f' },
  ];

  // Sample chart data
  const statusData = [
    { type: 'To Do', value: 28 },
    { type: 'In Progress', value: 42 },
    { type: 'Blocked', value: 10 },
    { type: 'Done', value: 48 },
  ];

  // const totalStatus = statusData.reduce((sum, d) => sum + d.value, 0);

  const priorityData = [
    { priority: 'Low', count: 34 },
    { priority: 'Medium', count: 56 },
    { priority: 'High', count: 25 },
    { priority: 'Critical', count: 13 },
  ];

  return (
    <AppLayout title="Dashboard" contentPadding={16}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              {kpis.map((k) => (
                <Col key={k.title} xs={24} sm={12} md={12} lg={6}>
                  <Card>
                    <Statistic title={k.title} value={k.value} valueStyle={{ color: k.color }} />
                  </Card>
                </Col>
              ))}
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title={<Space><FundOutlined /><Text strong>Tasks by Status</Text></Space>}>
                  <Pie
                    data={statusData}
                    angleField="value"
                    colorField="type"
                    radius={0.8}
                    // Some builds of @ant-design/plots/@antv may not include spider labels; avoid using them
                    label={false}
                    interactions={[{ type: 'element-active' }]}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title={<Space><BarChartOutlined /><Text strong>Tasks by Priority</Text></Space>}>
                  <Column
                    data={priorityData}
                    xField="priority"
                    yField="count"
                    columnStyle={{ radius: [4, 4, 0, 0] }}
                  />
                </Card>
              </Col>
            </Row>
      </Space>
    </AppLayout>
  );
};

export default DashboardPage;
