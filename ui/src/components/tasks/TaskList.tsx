import React from 'react';
import { Table, Tag } from 'antd';
import { Task } from '../../types/task';
import { ColumnsType } from 'antd/es/table';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
}

const getPriorityColor = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
  switch (priority) {
    case 'HIGH':
      return 'red';
    case 'MEDIUM':
      return 'orange';
    case 'LOW':
      return 'green';
    default:
      return 'default';
  }
};

const getStatusColor = (status: 'OPEN' | 'IN_PROGRESS' | 'DONE') => {
  switch (status) {
    case 'OPEN':
      return 'blue';
    case 'IN_PROGRESS':
      return 'purple';
    case 'DONE':
      return 'green';
    default:
      return 'default';
  }
};

const TaskList: React.FC<TaskListProps> = ({ tasks, loading }) => {
  const columns: ColumnsType<Task> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => <a href={`/tasks/${record.id}`}>{text}</a>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: 'HIGH' | 'MEDIUM' | 'LOW') => (
        <Tag color={getPriorityColor(priority)}>{priority}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'OPEN' | 'IN_PROGRESS' | 'DONE') => (
        <Tag color={getStatusColor(status)}>{status.replace('_', ' ')}</Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (dueDate) => (dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (assignedTo) => (assignedTo ? assignedTo.name : 'Unassigned'),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tasks}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default TaskList;
