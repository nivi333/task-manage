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
  Skeleton,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PaperClipOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Input, List, Tooltip } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import AppLayout from "components/layout/AppLayout";
import { HeaderTitle } from "components/common";
import taskService from "services/taskService";
import { Task } from "types/task";
import FileAttachmentViewer from "components/tasks/FileAttachmentViewer";
import SubtaskManagement from "components/tasks/SubtaskManagement";
import TaskFormDrawer from "components/tasks/TaskFormDrawer";
import "./TaskDetailPage.css";

const { Title, Text } = Typography;

// Enable fromNow() usage
dayjs.extend(relativeTime);

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [isDrawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  // Load list for the left panel
  const fetchSidebarTasks = () => {
    taskService
      .getTasks({ limit: 50 })
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.content ?? [];
        setTasks(list);
      })
      .catch(() => {
        // keep page usable even if sidebar list fails
      });
  };

  useEffect(() => {
    fetchSidebarTasks();
  }, []);

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

  // Render layout immediately; show skeleton/error only in the right panel

  // Footer actions removed per request

  return (
    <AppLayout
      title={
        <HeaderTitle
          level={3}
          style={{ display: "flex", alignItems: "center" }}
        >
          Task Details
        </HeaderTitle>
      }
    >
      <div className="task-detail-container">
        <Row gutter={[0, 24]} wrap={false}>
          {/* Left panel: Task List */}
          <Col xs={24} lg={8} style={{ background: "#fff", borderRadius: 6 }}>
            <Card
              className="task-list-card"
              bodyStyle={{ padding: 0, background: "#fff" }}
              style={{
                borderRadius: 6,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "0 16px 8px",
                  borderBottom: "1px solid #f0f0f0",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 8 }}>
                  <Tooltip title="Back to Task List">
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => navigate(-1)}
                      style={{ marginRight: 4 }}
                    />
                  </Tooltip>
                  <Text strong style={{ fontSize: 16, color: "#1f1f1f" }}>
                    All Tasks
                  </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Input
                    allowClear
                    placeholder="Search tasks"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    size="small"
                  />
                  <Tooltip title="Add New Task">
                    <Button
                      size="small"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingTask(null);
                        setDrawerVisible(true);
                      }}
                    >
                      New
                    </Button>
                  </Tooltip>
                </div>
              </div>

              <div style={{ padding: 0 }}>
                {(() => {
                  const taskList: Task[] = Array.isArray(tasks)
                    ? (tasks as Task[])
                    : (tasks as any)?.content ?? [];
                  return (
                    <List
                      dataSource={taskList.filter(
                        (t: Task) =>
                          t.title
                            .toLowerCase()
                            .includes(searchText.toLowerCase()) ||
                          (t.description || "")
                            .toLowerCase()
                            .includes(searchText.toLowerCase())
                      )}
                      renderItem={(item: Task) => (
                        <List.Item
                          onClick={() => navigate(`/tasks/${item.id}`)}
                          className={`task-list-item${
                            task && item.id === task.id ? " selected" : ""
                          }`}
                          style={{ cursor: "pointer" }}
                        >
                          <List.Item.Meta
                            title={
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  minWidth: 0,
                                  gap: 8,
                                }}
                              >
                                {/* Left: Task title */}
                                <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                                  <span
                                    className="task-list-title"
                                    style={{ minWidth: 0, display: "block" }}
                                    title={item.title}
                                  >
                                    {item.title}
                                  </span>
                                </span>
                                {/* Center: Project name */}
                                <span style={{ flex: "0 0 auto", textAlign: "center", padding: "0 6px" }}>
                                  <span
                                    className="task-list-project"
                                    style={{ fontSize: 12, color: "#666" }}
                                  >
                                    {(item as any)?.projectName ||
                                      (item as any)?.project?.name ||
                                      ""}
                                  </span>
                                </span>
                                {/* Right: Priority tag */}
                                <span
                                  style={{
                                    flex: "0 0 auto",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <Tag
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      height: 22,
                                      fontSize: 12,
                                      padding: "0 6px",
                                    }}
                                    color={
                                      item.priority === "HIGH"
                                        ? "red"
                                        : item.priority === "MEDIUM"
                                        ? "orange"
                                        : "green"
                                    }
                                  >
                                    {item.priority}
                                  </Tag>
                                </span>
                              </div>
                            }
                            // single-line item, no secondary description
                          />
                        </List.Item>
                      )}
                    />
                  );
                })()}
              </div>
            </Card>
          </Col>

          {/* Right panel: Task Details */}
          <Col xs={24} lg={16} style={{ marginLeft: 10 }}>
            <Card
              className="task-detail-card"
              style={{ background: "#fff" }}
              bodyStyle={{ padding: 15, background: "#fff" }}
            >
              {loading ? (
                <>
                  <Skeleton active paragraph={{ rows: 6 }} />
                  <Skeleton active paragraph={{ rows: 6 }} />
                </>
              ) : error || !task ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  {error || "Task not found."}
                </div>
              ) : (
                <div className="task-detail-table">
                  {/* Title */}
                  <div className="row">
                    <div className="cell cell-left">
                      <span className="cell-heading">Title</span>
                    </div>
                    <div className="cell cell-right">
                      <span className="cell-value">
                        <strong>{task.title}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="cell cell-left">
                      <span className="cell-heading">Assignee</span>
                    </div>
                    <div className="cell cell-right">
                      <span className="cell-value">
                        {task.assignedTo?.username || "Unassigned"}
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="cell cell-left">
                      <span className="cell-heading">Due Date</span>
                    </div>
                    <div className="cell cell-right">
                      <span className="cell-value">
                        {task.dueDate
                          ? dayjs(task.dueDate).format("MMM D, YYYY")
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="cell cell-left">
                      <span className="cell-heading">Created</span>
                    </div>
                    <div className="cell cell-right">
                      <span className="cell-value">
                        {dayjs(task.createdAt).fromNow()}
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="cell cell-left">
                      <span className="cell-heading">Status</span>
                    </div>
                    <div className="cell cell-right">
                      <Tag
                        color={getStatusColor(task.status)}
                        style={{ marginInlineEnd: 0 }}
                      >
                        {task.status?.replace(/_/g, " ")}
                      </Tag>
                    </div>
                  </div>
                  <div className="row">
                    <div className="cell cell-left">
                      <span className="cell-heading">Priority</span>
                    </div>
                    <div className="cell cell-right">
                      <Tag
                        color={getPriorityColor(task.priority)}
                        style={{ marginInlineEnd: 0 }}
                      >
                        {task.priority}
                      </Tag>
                    </div>
                  </div>
                  <div className="row">
                    <div className="cell cell-left">
                      <span className="cell-heading">Project</span>
                    </div>
                    <div className="cell cell-right">
                      <span className="cell-value">
                        {(task as any)?.projectName ||
                          (task as any)?.project?.name ||
                          "—"}
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="cell cell-left">
                      <span className="cell-heading">Description</span>
                    </div>
                    <div className="cell cell-right">
                      <span className="cell-value">
                        {task.description || "No description provided."}
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="cell cell-left">
                      <span className="cell-heading">Subtasks</span>
                    </div>
                    <div className="cell cell-right">
                      <SubtaskManagement
                        subtasks={task.subtasks || []}
                        parentTaskId={task.id}
                        compact
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="cell cell-left">
                      <span className="cell-heading">Attachments</span>
                    </div>
                    <div className="cell cell-right">
                      <FileAttachmentViewer
                        attachments={task.attachments || []}
                        compact
                      />
                    </div>
                  </div>
                  {/* Comments section removed per request */}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      <TaskFormDrawer
        open={isDrawerVisible}
        onClose={() => setDrawerVisible(false)}
        onTaskSaved={fetchSidebarTasks}
        task={editingTask}
      />
      </div>
    </AppLayout>
  );
};

export default TaskDetailPage;
