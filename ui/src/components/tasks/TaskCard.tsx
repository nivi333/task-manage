import React from "react";
import { Card } from "antd";
import { UserOutlined, BookOutlined, BugOutlined } from "@ant-design/icons";
import { Task } from "../../types/task";
import "./TaskCard.css";
import ProjectKeyBadge from "../common/ProjectKeyBadge";
import UserAvatar from "../common/UserAvatar";

interface TaskCardProps {
  task: Task;
  projectKey?: string;
  projectName?: string;
  projectColor?: string; // hex color for badge
  assigneeColor?: string; // hex color for avatar ring/fill
}

//

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  projectKey,
  projectName,
  projectColor,
  assigneeColor,
}) => {
  // Tooltip and initial handling are embedded in UserAvatar

  const tags = task.tags || [];
  const primaryLabel =
    tags.length > 0 ? String(tags[0]).toUpperCase() : undefined;
  const otherTags = tags.slice(1);

  const isBug =
    tags.map((t) => String(t).toUpperCase()).includes("BUG") ||
    task.priority === "HIGH";
  const issueCode = `TASK-${(task.id || "").slice(-5).toUpperCase()}`;

  return (
    <Card
      className={`task-card modern priority-${task.priority.toLowerCase()}`}
      hoverable
    >
      <div className="title-block">
        <div className="title" title={task.title}>
          {task.title}
        </div>
      </div>

      {primaryLabel && (
        <div className="pills">
          <span className="pill primary">{primaryLabel}</span>
        </div>
      )}

      {otherTags.length > 0 && (
        <div className="chips">
          {otherTags.map((tag) => (
            <span key={tag} className="chip">
              {String(tag).toUpperCase()}
            </span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="left-meta">
          <span className={`issue-icon ${isBug ? "bug" : "feature"}`}>
            {isBug ? <BugOutlined /> : <BookOutlined />}
          </span>
          <span className="issue-code">{issueCode}</span>
        </div>
        <div className="right-meta">
          {projectKey ? (
            <ProjectKeyBadge
              keyText={projectKey}
              name={projectName}
              color={projectColor || "#4096ff"}
            />
          ) : (
            <span className="project-key-pill">—</span>
          )}
          <UserAvatar user={task.assignedTo as any} size={26} />
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
