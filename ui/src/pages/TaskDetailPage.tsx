import type { ActivityLogItem } from "../services/activityService";
import React, { useEffect, useMemo, useState } from "react";
import { Card, Descriptions, Tag, Typography, Spin, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Task } from "../types/task";
import { taskService } from "../services/taskService";
import { TTButton } from "../components/common";
import { notificationService } from "../services/notificationService";
import { activityService } from "../services/activityService";
import {
  dependencyService,
  TaskDependency,
} from "../services/dependencyService";
import AppLayout from "../components/layout/AppLayout";
import CommentForm from "../components/comments/CommentForm";
import CommentList from "../components/comments/CommentList";
import TaskList from "../components/tasks/TaskList";
import HeaderTitle from "../components/common/HeaderTitle";
import { userService } from "../services/userService";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { CommentModel } from "../services/commentService";
import { commentService } from "../services/commentService";
import "../styles/pages/TaskDetail.css";

const { Text } = Typography;

// Define missing types to avoid TS errors
interface Attachment {
  id: string;
  name: string;
  url: string;
}

const TaskDetailPage: React.FC = () => {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [trackingStart, setTrackingStart] = useState<number | null>(null);
  const [trackingStartIso, setTrackingStartIso] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [mentionUsernames, setMentionUsernames] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [deps, setDeps] = useState<TaskDependency[]>([]);
  const [depsLoading, setDepsLoading] = useState(false);
  const [addDepVisible, setAddDepVisible] = useState(false);
  const [dependsOnId, setDependsOnId] = useState("");

  // Field-level validation and error state
  const [descError, setDescError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);

  const allowedStatuses = ["OPEN", "IN_PROGRESS", "DONE"];
  const allowedPriorities = ["HIGH", "MEDIUM", "LOW"];

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const t = await taskService.get(id);
        setTask(t);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Fetch all tasks for the left-side list
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const page = await taskService.list({
          size: 100,
          sortBy: "updatedAt",
          sortDir: "desc",
        });
        setTasks(page.content);
      } catch {
        setTasks([]);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const loadComments = async () => {
      if (!id) return;
      setCommentsLoading(true);
      try {
        const list = await commentService.list(id);
        setComments(list);
      } catch (e) {
        // errors surfaced globally
      } finally {
        setCommentsLoading(false);
      }
    };
    loadComments();
  }, [id]);

  // Polling-based realtime updates for comments (can be replaced with WebSocket later)
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const list = await commentService.list(id);
        setComments(list);
      } catch {
        // ignore polling errors
      }
    }, 10000); // 10s
    return () => clearInterval(interval);
  }, [id]);

  // Load initial mention users and provide async search hook
  useEffect(() => {
    const loadMentions = async () => {
      try {
        const res = await userService.getUsers({ size: 10 });
        setMentionUsernames(res.users.map((u) => u.username).filter(Boolean));
      } catch {
        // handled globally
      }
    };
    loadMentions();
  }, []);

  useEffect(() => {
    const loadActivities = async () => {
      if (!id) return;
      setActivitiesLoading(true);
      try {
        const page = await activityService.listForTask(id, 0, 20);
        setActivities(page.content || []);
      } catch (e) {
        // handled globally
      } finally {
        setActivitiesLoading(false);
      }
    };
    loadActivities();
  }, [id]);

  useEffect(() => {
    // Attachments can be derived from task payload if present
    const atts = (task as any)?.attachments as Attachment[] | undefined;
    if (atts) setAttachments(atts);
  }, [task]);

  useEffect(() => {
    const loadDeps = async () => {
      if (!id) return;
      setDepsLoading(true);
      try {
        const all = await dependencyService.list();
        setDeps(all.filter((d) => d.task?.id === id));
      } finally {
        setDepsLoading(false);
      }
    };
    loadDeps();
  }, [id]);

  const updateField = async (patch: Partial<Task>) => {
    if (!task || !id) return;
    setSaving(true);
    try {
      const updated = await taskService.update(id, patch as any);
      setTask((prev) => ({ ...(prev as Task), ...updated }));
      notificationService.success("Task updated");
      // clear any field-specific errors for keys we just updated
      if (Object.prototype.hasOwnProperty.call(patch, "description"))
        setDescError(null);
      if (Object.prototype.hasOwnProperty.call(patch, "status"))
        setStatusError(null);
      if (Object.prototype.hasOwnProperty.call(patch, "priority"))
        setPriorityError(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to update task";
      notificationService.error(msg);
      // Map backend validation error (400) to specific field if possible
      if (e?.response?.status === 400) {
        if (Object.prototype.hasOwnProperty.call(patch, "description"))
          setDescError(msg);
        if (Object.prototype.hasOwnProperty.call(patch, "status"))
          setStatusError(msg);
        if (Object.prototype.hasOwnProperty.call(patch, "priority"))
          setPriorityError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const elapsedSeconds = useMemo(
    () => (trackingStart ? Math.floor((Date.now() - trackingStart) / 1000) : 0),
    [trackingStart]
  );

  if (loading)
    return (
      <AppLayout title="Task Details" contentPadding={24}>
        <Spin />
      </AppLayout>
    );
  if (!task)
    return (
      <AppLayout title="Task Details" contentPadding={24}>
        Task not found.
      </AppLayout>
    );

  return (
    <AppLayout
      title={<HeaderTitle level={3}>Task Details</HeaderTitle>}
      contentPadding={24}
    >
      <div className="task-detail-container">
        {/* Left task list */}
        <div className="task-detail-sidebar">
          <div className="task-detail-sidebar-header">
            <TTButton
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.history.back()}
            />
            <HeaderTitle level={4} className="task-detail-sidebar-title">
              Tasks List
            </HeaderTitle>
          </div>
          {/* TaskList will be rendered here */}
          {/* Placeholder, will fetch and render tasks below */}
          {tasks && (
            <TaskList
              tasks={tasks}
              selectedTaskId={id || ""}
              onSelect={(tid) => navigate(`/tasks/${tid}`)}
            />
          )}
        </div>
        {/* Divider */}
        <div className="task-detail-divider" />
        {/* Main content */}
        <div className="task-detail-main">
          <Card className="task-detail-card" loading={saving}>
            <Descriptions bordered size="middle" column={2}>
              <Descriptions.Item label="Status" span={1}>
                <Select
                  size="small"
                  className="task-detail-select"
                  value={task.status}
                  onChange={(v) => {
                    if (!allowedStatuses.includes(v)) {
                      setStatusError("Invalid status");
                      return;
                    }
                    setStatusError(null);
                    updateField({ status: v });
                  }}
                  options={[
                    { label: "Open", value: "OPEN" },
                    { label: "In Progress", value: "IN_PROGRESS" },
                    { label: "Done", value: "DONE" },
                  ]}
                />
                {statusError && (
                  <div>
                    <Text type="danger">{statusError}</Text>
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Priority" span={1}>
                <Select
                  size="small"
                  className="task-detail-select"
                  value={task.priority}
                  onChange={(v) => {
                    if (!allowedPriorities.includes(v)) {
                      setPriorityError("Invalid priority");
                      return;
                    }
                    setPriorityError(null);
                    updateField({ priority: v as any });
                  }}
                  options={[
                    { label: "High", value: "HIGH" },
                    { label: "Medium", value: "MEDIUM" },
                    { label: "Low", value: "LOW" },
                  ]}
                />
                {priorityError && (
                  <div>
                    <Text type="danger">{priorityError}</Text>
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Due Date" span={1}>
                {task.dueDate ? new Date(task.dueDate).toLocaleString() : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Estimated Hours" span={1}>
                {task.estimatedHours ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Actual Hours" span={1}>
                {task.actualHours ?? 0}
              </Descriptions.Item>
              <Descriptions.Item label="Tags" span={1}>
                {task.tags?.length
                  ? task.tags.map((t) => <Tag key={t}>{t}</Tag>)
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Created At" span={1}>
                {task.createdAt
                  ? new Date(task.createdAt).toLocaleString()
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At" span={1}>
                {task.updatedAt
                  ? new Date(task.updatedAt).toLocaleString()
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          {/* Activity Log */}
          <Card
            className="task-activity-log-card"
            style={{ marginTop: 24 }}
            title="Activity Log"
          >
            {activitiesLoading ? (
              <Spin />
            ) : activities.length === 0 ? (
              <Text type="secondary">No activity yet.</Text>
            ) : (
              <ul className="task-activity-log-list">
                {activities.map((activity) => (
                  <li key={activity.id} style={{ marginBottom: 12 }}>
                    <div>
                      <Text strong>{activity.action}</Text>
                      {activity.details && (
                        <span style={{ marginLeft: 8 }}>
                          <Text type="secondary">{activity.details}</Text>
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {activity.user?.username ? (
                        <span>{activity.user.username} &bull; </span>
                      ) : null}
                      {activity.timestamp &&
                        new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskDetailPage;
