import React, { useEffect, useState, useRef } from "react";
import { Spin, Button, Tooltip, Drawer, Space, Typography, Empty } from "antd";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import TaskFormDrawer from "components/tasks/TaskFormDrawer";
import taskService, { TaskFilters } from "services/taskService";
import { Task } from "types/task";
import TaskList from "components/tasks/TaskList";
import FilterSidebar, { FilterSidebarRef } from "components/tasks/FilterSidebar";
import TagsManageButton from "components/tags/TagsManageButton";
// removed HeaderTitle as page-level title is handled by TasksPage

const TasksListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [isFilterSidebarVisible, setFilterSidebarVisible] = useState(false);
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const filterRef = useRef<FilterSidebarRef>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response: Task[] = await taskService.getTasks(filters);
      setTasks(response);
    } catch (error) {
      // Error is already handled by notificationService
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setDrawerVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDrawerVisible(true);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>All Tasks</Typography.Title>
        <Space>
          <Tooltip title="Filter tasks">
            <Button icon={<FilterOutlined />} onClick={() => setFilterSidebarVisible(true)}>
              Filters
            </Button>
          </Tooltip>
          <TagsManageButton label="Create/Manage Tags" />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
            Create Task
          </Button>
        </Space>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", margin: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : tasks.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No tasks found"
        />
      ) : (
        <TaskList tasks={tasks} loading={false} onEdit={handleEditTask} />
      )}
      <Drawer
        title="Filters"
        placement="right"
        onClose={() => setFilterSidebarVisible(false)}
        open={isFilterSidebarVisible}
        width={330}
        bodyStyle={{ padding: 0 }}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div />
            <Space>
              <Button onClick={() => filterRef.current?.reset()}>Reset</Button>
              <Button type="primary" onClick={() => filterRef.current?.submit()}>Apply</Button>
              <Button onClick={() => setFilterSidebarVisible(false)}>Cancel</Button>
            </Space>
          </div>
        }
      >
        <FilterSidebar
          ref={filterRef}
          onFilterChange={(newFilters) => {
            handleFilterChange(newFilters);
          }}
          onApplied={() => setFilterSidebarVisible(false)}
        />
      </Drawer>
      <TaskFormDrawer
        open={isDrawerVisible}
        onClose={() => setDrawerVisible(false)}
        onTaskSaved={fetchTasks}
        task={editingTask}
      />
    </div>
  );
};

export default TasksListPage;
