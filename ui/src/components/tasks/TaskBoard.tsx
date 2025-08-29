import React, { useState } from "react";
import { Row, Col, Card, Typography, Empty } from "antd";
import { Task } from "../../types/task";
import TaskCard from "./TaskCard";
import { createColorAllocator } from "../../utils/colorAllocator";
import "./TaskBoard.css";

const { Title } = Typography;

interface TaskBoardProps {
  tasks: Task[];
  onMove?: (
    taskId: string,
    newStatus: "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE"
  ) => void;
  projectMap?: Record<string, { key?: string; name: string }>;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onMove,
  projectMap = {},
}) => {
  // Allocate unique colors per entity pool
  const projectColorAlloc = React.useMemo(() => createColorAllocator(), []);
  const userColorAlloc = React.useMemo(() => createColorAllocator(), []);

  const columns = {
    OPEN: tasks.filter((task) => task.status === "OPEN"),
    IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS"),
    TESTING: tasks.filter((task) => task.status === "TESTING"),
    DONE: tasks.filter((task) => task.status === "DONE"),
  };

  const getColors = (task: Task) => {
    const pColor = task.projectId
      ? projectColorAlloc.getColor(task.projectId)
      : projectColorAlloc.getColor("__no_project__");
    const uid = task.assignedTo?.id || task.assignedTo?.username || "__unassigned__";
    let aColor = userColorAlloc.getColor(String(uid));
    if (aColor === pColor) {
      const palette = userColorAlloc.palette;
      const idx = palette.indexOf(aColor);
      aColor = palette[(idx + 1) % palette.length];
    }
    return { projectColor: pColor, assigneeColor: aColor };
  };

  const WIP_LIMITS: Record<
    "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE",
    number | undefined
  > = {
    OPEN: undefined,
    IN_PROGRESS: 5,
    TESTING: 5,
    DONE: undefined,
  };

  const buildTitle = (
    label: string,
    key: "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE"
  ) => (
    <div className="lane-title">
      <span className="lane-name">{label}</span>
      <span className="lane-count">
        {columns[key].length}
        {WIP_LIMITS[key] ? `/${WIP_LIMITS[key]}` : ""}
      </span>
    </div>
  );

  const [overLane, setOverLane] = useState<
    null | "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE"
  >(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    taskId: string
  ) => {
    e.dataTransfer.setData("text/taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    newStatus: "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE"
  ) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/taskId");
    // WIP enforcement
    const limit = WIP_LIMITS[newStatus];
    if (limit && columns[newStatus].length >= limit) {
      setOverLane(null);
      return;
    }
    if (taskId && onMove) onMove(taskId, newStatus);
    setOverLane(null);
  };

  return (
    <Row gutter={16} className="task-board-row">
      <Col span={6}>
        <Card
          title={buildTitle("Open", "OPEN")}
          className={`task-board-column modern tt-kanban-card lane-open ${
            overLane === "OPEN" ? "drag-over" : ""
          }`}
          onDragOver={handleDragOver}
          onDragEnter={() => setOverLane("OPEN")}
          onDragLeave={() => setOverLane(null)}
          onDrop={(e) => handleDrop(e, "OPEN")}
        >
          {columns.OPEN.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No open tasks"
            />
          ) : (
            columns.OPEN.map((task) => (
              <div
                key={task.id}
                className="task-card-draggable"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                <TaskCard
                  task={task}
                  projectKey={
                    task.projectId ? projectMap[task.projectId]?.key : undefined
                  }
                  projectName={
                    task.projectId
                      ? projectMap[task.projectId]?.name
                      : undefined
                  }
                  {...getColors(task)}
                />
              </div>
            ))
          )}
        </Card>
      </Col>
      <Col span={6}>
        <Card
          title={buildTitle("In Progress", "IN_PROGRESS")}
          className={`task-board-column modern tt-kanban-card lane-inprogress ${
            overLane === "IN_PROGRESS" ? "drag-over" : ""
          }`}
          onDragOver={handleDragOver}
          onDragEnter={() => setOverLane("IN_PROGRESS")}
          onDragLeave={() => setOverLane(null)}
          onDrop={(e) => handleDrop(e, "IN_PROGRESS")}
        >
          {columns.IN_PROGRESS.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No in-progress tasks"
            />
          ) : (
            columns.IN_PROGRESS.map((task) => (
              <div
                key={task.id}
                className="task-card-draggable"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                <TaskCard
                  task={task}
                  projectKey={
                    task.projectId ? projectMap[task.projectId]?.key : undefined
                  }
                  projectName={
                    task.projectId
                      ? projectMap[task.projectId]?.name
                      : undefined
                  }
                  {...getColors(task)}
                />
              </div>
            ))
          )}
        </Card>
      </Col>
      <Col span={6}>
        <Card
          title={buildTitle("Testing", "TESTING")}
          className={`task-board-column modern tt-kanban-card lane-testing ${
            overLane === "TESTING" ? "drag-over" : ""
          }`}
          onDragOver={handleDragOver}
          onDragEnter={() => setOverLane("TESTING")}
          onDragLeave={() => setOverLane(null)}
          onDrop={(e) => handleDrop(e, "TESTING")}
        >
          {columns.TESTING.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No testing tasks"
            />
          ) : (
            columns.TESTING.map((task) => (
              <div
                key={task.id}
                className="task-card-draggable"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                <TaskCard
                  task={task}
                  projectKey={
                    task.projectId ? projectMap[task.projectId]?.key : undefined
                  }
                  projectName={
                    task.projectId
                      ? projectMap[task.projectId]?.name
                      : undefined
                  }
                  {...getColors(task)}
                />
              </div>
            ))
          )}
        </Card>
      </Col>
      <Col span={6}>
        <Card
          title={buildTitle("Done", "DONE")}
          className={`task-board-column modern tt-kanban-card lane-done ${
            overLane === "DONE" ? "drag-over" : ""
          }`}
          onDragOver={handleDragOver}
          onDragEnter={() => setOverLane("DONE")}
          onDragLeave={() => setOverLane(null)}
          onDrop={(e) => handleDrop(e, "DONE")}
        >
          {columns.DONE.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No done tasks"
            />
          ) : (
            columns.DONE.map((task) => (
              <div
                key={task.id}
                className="task-card-draggable"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                <TaskCard
                  task={task}
                  projectKey={
                    task.projectId ? projectMap[task.projectId]?.key : undefined
                  }
                  projectName={
                    task.projectId
                      ? projectMap[task.projectId]?.name
                      : undefined
                  }
                  {...getColors(task)}
                />
              </div>
            ))
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default TaskBoard;
