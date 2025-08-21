import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Button, Tooltip, Drawer, Space } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
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
  const [filtersVisible, setFiltersVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const fetchedTasks = await taskService.getTasks(filters);
        setTasks(fetchedTasks);
      } catch (error) {
        // Error is already handled by notificationService in taskService
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [filters]);

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  return (
    <AppLayout title={<HeaderTitle level={3}>Task List</HeaderTitle>} contentPadding={24}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Space>
          <Tooltip title="Filter tasks">
            <Button icon={<FilterOutlined />} onClick={() => setFiltersVisible(true)}>
              Filters
            </Button>
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tasks/new')}>
            Create Task
          </Button>
        </Space>
      </div>
      <Row gutter={16}>
        <Col span={24}>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <TaskList tasks={tasks} loading={loading} />
          )}
        </Col>
      </Row>
      <Drawer
        title="Filters"
        placement="left"
        onClose={() => setFiltersVisible(false)}
        open={filtersVisible}
        width={300}
      >
        <FilterSidebar onFilterChange={(newFilters) => {
          handleFilterChange(newFilters);
          setFiltersVisible(false);
        }} />
      </Drawer>
    </AppLayout>
  );

};

export default TasksListPage;
