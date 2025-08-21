import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Button, Tooltip, Drawer, Space } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import TaskFormDrawer from 'components/tasks/TaskFormDrawer';
import taskService, { TaskFilters } from 'services/taskService';
import { Task } from 'types/task';
import TaskList from 'components/tasks/TaskList';
import FilterSidebar from 'components/tasks/FilterSidebar';
import AppLayout from 'components/layout/AppLayout';
import { HeaderTitle } from 'components/common';

const TasksListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [isFilterSidebarVisible, setFilterSidebarVisible] = useState(false);
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response: any = await taskService.getTasks(filters);
      setTasks(response.content || []);
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
    <AppLayout title={<HeaderTitle level={3}>Task List</HeaderTitle>} contentPadding={24}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Space>
          <Tooltip title="Filter tasks">
            <Button icon={<FilterOutlined />} onClick={() => setFilterSidebarVisible(true)}>
              Filters
            </Button>
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
            Create Task
          </Button>
        </Space>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <TaskList tasks={tasks} loading={false} onEdit={handleEditTask} />
      )}
      <Drawer
        title="Filters"
        placement="left"
        onClose={() => setFilterSidebarVisible(false)}
        open={isFilterSidebarVisible}
        width={300}
      >
        <FilterSidebar onFilterChange={(newFilters) => {
          handleFilterChange(newFilters);
          setFilterSidebarVisible(false);
        }} />
      </Drawer>
      <TaskFormDrawer
        open={isDrawerVisible}
        onClose={() => setDrawerVisible(false)}
        onTaskSaved={fetchTasks}
        task={editingTask}
      />
    </AppLayout>
  );
};

export default TasksListPage;
