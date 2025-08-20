import React, { useCallback, useEffect, useState } from "react";
import { Card } from "antd";
import { Task } from "../types/task";
import { taskService } from "../services/taskService";
import TaskBoard, { BoardStatus } from "../components/tasks/TaskBoard";
import { notificationService } from "../services/notificationService";
import AppLayout from "../components/layout/AppLayout";
import { HeaderTitle } from "../components/common";

const TasksBoardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const page = await taskService.list({
        size: 100,
        sortBy: "updatedAt",
        sortDir: "desc",
      });
      // Map each task to add projectId at the top level
      const mapped = page.content.map((t: any) => ({
        ...t,
        projectId: t.project?.id || t.projectId || undefined,
      }));
      setTasks(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleChange = async (id: string, status: BoardStatus) => {
    try {
      // Find the original task to get all required fields
      const original = tasks.find((t) => t.id === id);
      if (!original) throw new Error("Task not found");
      const payload: any = {
        title: original.title,
        status,
        priority: original.priority,
        assignedTo: original.assignedTo,
        projectId: (original as any).projectId,
      };
      payload.description = original.description ?? "";
      if (original.dueDate) payload.dueDate = original.dueDate;
      if (original.estimatedHours !== undefined)
        payload.estimatedHours = original.estimatedHours;
      if (original.actualHours !== undefined)
        payload.actualHours = original.actualHours;
      if (original.tags) payload.tags = original.tags;
      console.log("Task update payload:", payload);
      const updated = await taskService.update(id, payload);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: updated.status } : t))
      );
      notificationService.success("Status updated");
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to update status";
      notificationService.error(msg);
    }
  };

  return (
    <AppLayout
      title={<HeaderTitle level={3}>Kanban Board</HeaderTitle>}
      contentPadding={24}
    >
      <Card loading={loading}>
        <TaskBoard tasks={tasks} onStatusChange={handleChange} />
      </Card>
    </AppLayout>
  );
};

export default TasksBoardPage;
