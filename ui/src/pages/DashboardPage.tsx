import React from 'react';
import { Layout, Menu, Button, Typography, Space, Row, Col, Card, Statistic, theme } from 'antd';
import { BarChartOutlined, FundOutlined, ProfileOutlined, UnorderedListOutlined, TeamOutlined, AppstoreOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/authService';
import { Pie, Column } from '@ant-design/plots';
import BrandLogo from '../components/common/BrandLogo';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer }
  } = theme.useToken();

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

  const priorityData = [
    { priority: 'Low', count: 34 },
    { priority: 'Medium', count: 56 },
    { priority: 'High', count: 25 },
    { priority: 'Critical', count: 13 },
  ];

  const menuItems = [
    { key: '/dashboard', icon: <AppstoreOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/tasks', icon: <UnorderedListOutlined />, label: <Link to="/tasks">Task List</Link> },
    { key: '/tasks/board', icon: <ProfileOutlined />, label: <Link to="/tasks/board">Kanban Board</Link> },
    { key: '/tasks/stats', icon: <FundOutlined />, label: <Link to="/tasks/stats">Statistics</Link> },
    { key: '/admin/users', icon: <TeamOutlined />, label: <Link to="/admin/users">Users</Link> },
    { key: '/profile', icon: <UserOutlined />, label: <Link to="/profile">My Profile</Link> },
  ];

  const selectedKeys = menuItems
    .map((m) => m.key)
    .filter((k) => location.pathname.startsWith(k));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="lg">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, overflow: 'hidden' }}>
          <BrandLogo compact={collapsed} variant="dark" />
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={selectedKeys} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer, padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space size={12}>
              <BrandLogo variant="light" />
            </Space>
            <Space>
              <Button icon={<BarChartOutlined />} onClick={() => navigate('/tasks/stats')}>Stats</Button>
              <Button danger icon={<LogoutOutlined />} onClick={() => { authAPI.logout(); window.location.href = '/login'; }}>Logout</Button>
            </Space>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
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
                    label={{ type: 'spider', content: '{name} {percentage}' }}
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
