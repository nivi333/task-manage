import React, { useMemo } from "react";
import { Layout, Menu, Typography } from "antd";
import { AppstoreOutlined, BarsOutlined, AreaChartOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppLayout from "components/layout/AppLayout";

const { Sider, Content } = Layout;
const { Title } = Typography;

const TasksPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = useMemo(() => {
    if (location.pathname.endsWith("/board")) return "board";
    if (location.pathname.endsWith("/stats")) return "stats";
    return "list";
  }, [location.pathname]);

  const sectionTitle = useMemo(() => {
    switch (selectedKey) {
      case "board":
        return "Kanban Board";
      case "stats":
        return "Statistics";
      default:
        return "Task List";
    }
  }, [selectedKey]);

  return (
    <AppLayout title="Tasks">
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={250} style={{ background: "#fff" }} breakpoint="lg" collapsedWidth={0}
          className="tasks-left-menu">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: "100%", borderRight: 0 }}
            items={[
              {
                key: "list",
                icon: <BarsOutlined />,
                label: "Task List",
                onClick: () => navigate("/tasks"),
              },
              {
                key: "board",
                icon: <AppstoreOutlined />,
                label: "Kanban Board",
                onClick: () => navigate("/tasks/board"),
              },
              {
                key: "stats",
                icon: <AreaChartOutlined />,
                label: "Statistics",
                onClick: () => navigate("/tasks/stats"),
              },
            ]}
          />
        </Sider>
        <Content style={{ padding: "0 24px 24px" }}>
          {/* Show page-level title for list and stats only; board renders its own header */}
          {selectedKey !== 'list' && selectedKey !== 'board' && (
            <div style={{ marginBottom: 12 }}>
              <Title level={3} style={{ margin: 0 }}>{sectionTitle}</Title>
            </div>
          )}
          <Outlet />
        </Content>
      </Layout>
    </AppLayout>
  );
};

export default TasksPage;
