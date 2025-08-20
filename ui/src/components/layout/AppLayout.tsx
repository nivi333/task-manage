import React from 'react';
import { Layout, Menu, Button, Typography, Space, theme } from 'antd';
import { BarChartOutlined, FundOutlined, ProfileOutlined, UnorderedListOutlined, TeamOutlined, AppstoreOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/authService';
import logo from '../../logo.svg';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  contentPadding?: number;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title, contentPadding = 0 }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer }
  } = theme.useToken();

  // Determine admin from JWT roles similar to AdminRoute
  const isAdmin = React.useMemo(() => {
    const token = authAPI.getToken();
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        const roles: string[] = payload?.roles || [];
        return roles.includes('ADMIN');
      }
    } catch {}
    return false;
  }, []);

  const menuItems = [
    { key: '/dashboard', icon: <AppstoreOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/projects', icon: <AppstoreOutlined />, label: <Link to="/projects">Projects</Link> },
    { key: '/tasks', icon: <UnorderedListOutlined />, label: <Link to="/tasks">Task List</Link> },
    { key: '/tasks/board', icon: <ProfileOutlined />, label: <Link to="/tasks/board">Kanban Board</Link> },
    { key: '/tasks/stats', icon: <FundOutlined />, label: <Link to="/tasks/stats">Statistics</Link> },
    { key: '/teams', icon: <TeamOutlined />, label: <Link to="/teams">Team Dashboard</Link> },
    // Show Users only for admins
    ...(isAdmin ? [{ key: '/admin/users', icon: <TeamOutlined />, label: <Link to="/admin/users">Users</Link> }] : []),
    { key: '/profile', icon: <UserOutlined />, label: <Link to="/profile">My Profile</Link> },
  ];

  const selectedKeys = menuItems
    .map((m) => m.key)
    .filter((k) => location.pathname.startsWith(k));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="lg">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, overflow: 'visible' }}>
          <img src={logo} alt="Task Tango" style={{ height: 40, width: 'auto', display: 'block' }} />
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={selectedKeys} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header className="app-header" style={{ background: colorBgContainer, padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
              {title ? (
                typeof title === 'string' ? <Title level={4} style={{ margin: 0 }}>{title}</Title> : title
              ) : null}
            </div>
            <Space>
              <Button icon={<BarChartOutlined />} onClick={() => navigate('/tasks/stats')}>Stats</Button>
              <Button danger icon={<LogoutOutlined />} onClick={() => { authAPI.logout(); window.location.href = '/login'; }} style={{ border: '1.5px solid #ff4d4f' }}>Logout</Button>
            </Space>
          </div>
        </Header>
        <Content style={{ margin: 0, padding: contentPadding }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
