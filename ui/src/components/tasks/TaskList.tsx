import React from 'react';
import { Tag, Button, Space, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types/task';
import { ColumnsType } from 'antd/es/table';
import TTTable from '../common/TTTable';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
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

const getStatusColor = (status: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DONE') => {
  switch (status) {
    case 'OPEN':
      return 'blue';
    case 'IN_PROGRESS':
      return 'purple';
    case 'TESTING':
      return 'gold';
    case 'DONE':
      return 'green';
    default:
      return 'default';
  }
};

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, onEdit }) => {
  const navigate = useNavigate();
  const columns: ColumnsType<Task> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => <a onClick={() => navigate(`/tasks/${record.id}`)}>{text}</a>,
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
      render: (status: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DONE') => (
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
      render: (assignedTo) => (assignedTo ? `${assignedTo.firstName} ${assignedTo.lastName}` : 'Unassigned'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: 'black' }} />} 
              onClick={() => onEdit(record)} 
              style={{ border: 'none' }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this task?"
              onConfirm={() => console.log('Task deleted', record.id)} // Placeholder for delete logic
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                style={{ border: 'none' }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <TTTable
      columns={columns}
      dataSource={tasks}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default TaskList;
