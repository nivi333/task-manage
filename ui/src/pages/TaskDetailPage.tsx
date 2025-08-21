import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  message,
  Button,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Divider,
  Space,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FlagOutlined,
  PaperClipOutlined,
  LinkOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import AppLayout from "components/layout/AppLayout";
import { HeaderTitle } from "components/common";
import taskService from "services/taskService";
import { Task } from "types/task";
import TaskDescription from "components/tasks/TaskDescription";
import CommentSection from "components/tasks/CommentSection";
import FileAttachmentViewer from "components/tasks/FileAttachmentViewer";
import SubtaskManagement from "components/tasks/SubtaskManagement";

const { Title, Text } = Typography;

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    taskService
      .getTaskById(id!)
      .then(setTask)
      .catch((err: any) => {
        setError("Failed to load task details");
        message.error("Failed to load task details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Helper functions for status and priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "red";
      case "MEDIUM":
        return "orange";
      case "LOW":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "TODO":
        return "default";
      case "IN_PROGRESS":
        return "blue";
      case "IN_REVIEW":
        return "purple";
      case "DONE":
        return "green";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
    );
  }

  if (error || !task) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        {error || "Task not found."}
      </div>
    );
  }

  const handleSave = () => {
    // TODO: Implement save functionality
    message.success("Task saved successfully");
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  const footer = (
    <div className="footer-actions">
      <Button onClick={handleCancel} style={{ minWidth: 100 }}>
        Cancel
      </Button>
      <Button type="primary" onClick={handleSave} style={{ minWidth: 150 }}>
        Save Changes
      </Button>
    </div>
  );

  return (
    <AppLayout
      title={
        <HeaderTitle
          level={3}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginRight: "16px" }}
          >
            Back to Tasks
          </Button>
        </HeaderTitle>
      }
      contentPadding={24}
      footer={footer}
    >
      <div
        className="task-detail-container"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="task-detail-card">
              <div className="task-header">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
                    {task.title}
                  </Title>
                  <Space>
                    <Tag
                      color={getStatusColor(task.status)}
                      style={{ fontWeight: 500 }}
                    >
                      {task.status?.replace(/_/g, " ")}
                    </Tag>
                    <Tag
                      color={getPriorityColor(task.priority)}
                      style={{ fontWeight: 500 }}
                    >
                      {task.priority}
                    </Tag>
                  </Space>
                </div>

                <div style={{ margin: "16px 0" }}>
                  <Space size="middle">
                    <Text type="secondary">
                      <UserOutlined />{" "}
                      {task.assignedTo?.username || "Unassigned"}
                    </Text>
                    {task.dueDate && (
                      <Text type="secondary">
                        <CalendarOutlined />{" "}
                        {dayjs(task.dueDate).format("MMM D, YYYY")}
                      </Text>
                    )}
                    <Text type="secondary">
                      <ClockCircleOutlined /> {dayjs(task.createdAt).fromNow()}
                    </Text>
                  </Space>
                </div>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              <div className="task-content">
                <TaskDescription task={task} />

                <div style={{ marginTop: 24 }}>
                  <SubtaskManagement
                    subtasks={task.subtasks || []}
                    parentTaskId={task.id}
                  />
                </div>

                <div style={{ marginTop: 24 }}>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    <PaperClipOutlined /> Attachments
                  </Title>
                  <FileAttachmentViewer attachments={task.attachments || []} />
                </div>

                <div style={{ marginTop: 24 }}>
                  <CommentSection taskId={task.id} />
                </div>
              </div>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Card
              className="task-sidebar"
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                marginBottom: 24,
              }}
            >
              <Title level={5} style={{ marginBottom: 16 }}>
                Task Details
              </Title>

              <div style={{ marginBottom: 16 }}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: 12, marginBottom: 4 }}
                >
                  Status
                </Text>
                <Tag
                  color={getStatusColor(task.status)}
                  style={{ fontSize: 13, padding: "4px 8px" }}
                >
                  {task.status?.replace(/_/g, " ")}
                </Tag>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: 12, marginBottom: 4 }}
                >
                  Priority
                </Text>
                <Tag
                  color={getPriorityColor(task.priority)}
                  style={{ fontSize: 13, padding: "4px 8px" }}
                >
                  {task.priority}
                </Tag>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: 12, marginBottom: 4 }}
                >
                  Assignee
                </Text>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ marginRight: 8 }}
                  />
                  <Text>{task.assignedTo?.username || "Unassigned"}</Text>
                </div>
              </div>

              {task.dueDate && (
                <div style={{ marginBottom: 16 }}>
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 12, marginBottom: 4 }}
                  >
                    Due Date
                  </Text>
                  <Text>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    {dayjs(task.dueDate).format("MMM D, YYYY")}
                  </Text>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: 12, marginBottom: 4 }}
                >
                  Created
                </Text>
                <Text>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  {dayjs(task.createdAt).format("MMM D, YYYY")}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
};

export default TaskDetailPage;
