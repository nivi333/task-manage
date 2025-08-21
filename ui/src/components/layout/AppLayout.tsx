import React from "react";
import { Layout, Menu, Button, Typography, Space, theme } from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/authService";
import logo from "../../logo.svg";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  contentPadding?: number | string;
  footer?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  contentPadding = 0,
  footer,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const roles = authAPI.getUserRoles();
  const isAdmin = roles.includes("ADMIN");

  const menuItems = [
    {
      key: "/dashboard",
      icon: <AppstoreOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "/projects",
      icon: <AppstoreOutlined />,
      label: <Link to="/projects">Projects</Link>,
    },
    {
      key: "/tasks",
      icon: <UnorderedListOutlined />,
      label: <Link to="/tasks">Tasks</Link>,
    },
    {
      key: "/teams",
      icon: <TeamOutlined />,
      label: <Link to="/teams">Team Creation & Management</Link>,
    },
    // Show Users only for admins
    ...(isAdmin
      ? [
          {
            key: "/admin/users",
            icon: <TeamOutlined />,
            label: <Link to="/admin/users">Users</Link>,
          },
        ]
      : []),
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">My Profile</Link>,
    },
  ];

  const selectedKeys = menuItems
    .map((m) => m.key)
    .filter((k) => location.pathname.startsWith(k));

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        width={210}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            overflow: "visible",
          }}
        >
          <img
            src={logo}
            alt="Task Tango"
            style={{ height: 40, width: "auto", display: "block" }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        />
      </Sider>
      <Layout>
        <Header
          className="app-header"
          style={{ background: colorBgContainer, padding: "0 16px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{ minHeight: 40, display: "flex", alignItems: "center" }}
            >
              {title ? (
                typeof title === "string" ? (
                  <Title level={4} style={{ margin: 0 }}>
                    {title}
                  </Title>
                ) : (
                  title
                )
              ) : null}
            </div>
            <Space style={{ marginLeft: "auto" }}>
              <Button
                icon={<BarChartOutlined />}
                onClick={() => navigate("/tasks/stats")}
              >
                Stats
              </Button>
              <Button
                danger
                icon={<LogoutOutlined />}
                onClick={() => {
                  authAPI.logout();
                  window.location.href = "/login";
                }}
                style={{ border: "1.5px solid #ff4d4f" }}
              >
                Logout
              </Button>
            </Space>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: contentPadding,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8,
            position: "relative",
            paddingBottom: footer ? "80px" : undefined,
          }}
        >
          {children}
          {footer && (
            <div
              style={{
                position: "fixed",
                bottom: 0,
                right: 0,
                left: collapsed ? 80 : 200,
                background: colorBgContainer,
                padding: "16px 24px",
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
                zIndex: 10,
                transition: "left 0.2s",
              }}
            >
              {footer}
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
