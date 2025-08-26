import React from "react";
import { Layout, Menu, Button, Typography, Space, theme, Tooltip, Avatar } from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  BarChartOutlined,
  MoonOutlined,
  SunOutlined,
  BellOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../context/ThemeContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/authService";
import { userService } from "../../services/userService";
import type { UserProfile } from "../../types/user";
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
  const { isDark, toggleTheme } = useTheme();

  const roles = authAPI.getUserRoles();
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");

  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setProfileLoading(true);
        const p = await userService.getProfile();
        if (mounted) setProfile(p);
      } catch (e) {
        // best-effort; header can still render without profile
      } finally {
        if (mounted) setProfileLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const getInitials = (p?: UserProfile | null) => {
    if (!p) return "";
    const a = (p.firstName || "").trim();
    const b = (p.lastName || "").trim();
    const un = (p.username || "").trim();
    const initials = `${a.charAt(0)}${b.charAt(0)}` || un.charAt(0);
    return initials.toUpperCase();
  };

  const menuItems = [
    {
      key: "/dashboard",
      icon: <AppstoreOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "/search",
      icon: <SearchOutlined />,
      label: <Link to="/search">Search</Link>,
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
      key: "/analytics",
      icon: <BarChartOutlined />,
      label: <Link to="/analytics">Analytics</Link>,
    },
    {
      key: "/notifications",
      icon: <BellOutlined />,
      label: <Link to="/notifications">Notifications</Link>,
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    },
    {
      key: "/teams",
      icon: <TeamOutlined />,
      label: <Link to="/teams">Teams</Link>,
    },
    // Show Users for admins and managers
    ...(isAdmin || isManager
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
              <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
                <Button
                  className="icon-only-button"
                  aria-label="Toggle theme"
                  onClick={toggleTheme}
                >
                  {isDark ? <SunOutlined /> : <MoonOutlined />}
                </Button>
              </Tooltip>
              <Button
                icon={<BarChartOutlined />}
                onClick={() => navigate("/tasks/stats")}
              >
                Stats
              </Button>
              <div
                onClick={() => navigate("/profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "2px 8px",
                  borderRadius: 16,
                  border: "1px solid var(--color-border)",
                }}
              >
                <Avatar
                  src={profile?.profilePicture}
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                    fontWeight: 600,
                  }}
                  size={28}
                >
                  {!profile?.profilePicture ? getInitials(profile) : null}
                </Avatar>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                  <Typography.Text style={{ margin: 0 }}>
                    {profile?.username || "My Account"}
                  </Typography.Text>
                  {profile?.firstName || profile?.lastName ? (
                    <Typography.Text type="secondary" style={{ margin: 0, fontSize: 12 }}>
                      {[profile?.firstName, profile?.lastName].filter(Boolean).join(" ")}
                    </Typography.Text>
                  ) : null}
                </div>
              </div>
              <Button
                danger
                icon={<LogoutOutlined />}
                onClick={() => {
                  authAPI.logout();
                  window.location.href = "/login";
                }}
                style={{ border: "1px solid var(--color-error)" }}
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
            background: "transparent",
            borderRadius: 0,
            position: "relative",
            // Reserve extra space for fixed footer to prevent content overlap
            paddingBottom: footer ? "96px" : undefined,
          }}
        >
          {children}
          {footer && (
            <div
              style={{
                position: "fixed",
                bottom: 0,
                right: 0,
                // Match Sider width exactly to avoid minor misalignment
                left: collapsed ? 80 : 210,
                background: colorBgContainer,
                padding: "16px 24px",
                borderTop: "1px solid var(--color-border)",
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
