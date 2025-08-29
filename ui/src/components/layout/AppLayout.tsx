import React, { useState } from "react";
import { Layout, Menu, Button, Typography, Space, theme, Avatar } from "antd";
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
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../context/ThemeContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/authService";
import { userService } from "../../services/userService";
import type { UserProfile } from "../../types/user";
import logo from "../../logo.svg";
import AnimationWrapper from "../common/AnimationWrapper";
import Hint from "../common/Hint";
import HelpDrawer from "../help/HelpDrawer";

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
  const [helpOpen, setHelpOpen] = useState(false);
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
          style={{
            padding: "0 16px",
            background: colorBgContainer,
          }}
        >
          <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
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
              <Hint title="Open help and documentation">
                <Button
                  className="icon-only-button"
                  aria-label="Open help"
                  onClick={() => setHelpOpen(true)}
                  icon={<QuestionCircleOutlined />}
                />
              </Hint>
              <Hint title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
                <Button
                  className="icon-only-button"
                  aria-label="Toggle theme"
                  onClick={toggleTheme}
                >
                  {isDark ? <SunOutlined /> : <MoonOutlined />}
                </Button>
              </Hint>
              <Hint title="View task statistics">
                <Button
                  icon={<BarChartOutlined />}
                  onClick={() => navigate("/tasks/stats")}
                >
                  Stats
                </Button>
              </Hint>
              <Hint title="Log out of your account">
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
              </Hint>
              <Hint title="Go to your profile">
                <div
                  onClick={() => navigate("/profile")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    padding: "2px 8px",
                    borderRadius: 16,
                    /* remove border for profile section */
                    border: "none",
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography.Text style={{ margin: 0 }}>
                      {profile?.username || "My Account"}
                    </Typography.Text>
                  </div>
                </div>
              </Hint>
            </Space>
          </div>
        </Header>
        {/* Gradient divider below header */}
        <div
          style={{
            height: 2,
            background:
              "linear-gradient(90deg, rgba(105,108,255,0.35) 0%, rgba(239,68,68,0.25) 50%, rgba(99,102,241,0.35) 100%)",
          }}
        />
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
          <AnimationWrapper motionKey={location.pathname}>{children}</AnimationWrapper>
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
