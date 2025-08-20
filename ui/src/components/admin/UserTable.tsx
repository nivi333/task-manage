import React from 'react';
import Dropdown from '../common/Dropdown';
import { Avatar, Tag, Space, Tooltip, Typography } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import { 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { User, UserRole, UserStatus, UserFilters } from '../../types/user';
import { TTButton, TTTable } from '../common';

const { Text } = Typography;

interface UserTableProps {
  users: User[];
  loading?: boolean;
  selectedUserIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onStatusChange: (user: User, status: UserStatus) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  selectedUserIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onStatusChange,
  pagination,
  filters,
  onFiltersChange
}) => {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'red';
      case UserRole.MANAGER: return 'blue';
      case UserRole.USER: return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE: return 'success';
      case UserStatus.INACTIVE: return 'default';
      case UserStatus.SUSPENDED: return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE: return <CheckCircleOutlined />;
      case UserStatus.INACTIVE: return <StopOutlined />;
      case UserStatus.SUSPENDED: return <ExclamationCircleOutlined />;
      default: return null;
    }
  };

  const getActionMenuItems = (user: User) => [
    {
      key: 'edit',
      label: (
        <Space>
          <EditOutlined />
          Edit User
        </Space>
      ),
      onClick: () => onEdit(user),
    },
    {
      type: 'divider' as const,
    },
    ...(user.status !== UserStatus.ACTIVE ? [{
      key: 'activate',
      label: (
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          Activate
        </Space>
      ),
      onClick: () => onStatusChange(user, UserStatus.ACTIVE),
    }] : []),
    ...(user.status !== UserStatus.INACTIVE ? [{
      key: 'deactivate',
      label: (
        <Space>
          <StopOutlined style={{ color: '#faad14' }} />
          Deactivate
        </Space>
      ),
      onClick: () => onStatusChange(user, UserStatus.INACTIVE),
    }] : []),
    ...(user.status !== UserStatus.SUSPENDED ? [{
      key: 'suspend',
      label: (
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          Suspend
        </Space>
      ),
      onClick: () => onStatusChange(user, UserStatus.SUSPENDED),
    }] : []),
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      label: (
        <Space>
          <DeleteOutlined style={{ color: '#ff4d4f' }} />
          Delete User
        </Space>
      ),
      onClick: () => onDelete(user),
    },
  ];

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            src={record.profilePicture}
          />
          <div>
            <div>
              <Text strong>{record.firstName} {record.lastName}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                @{record.username}
              </Text>
            </div>
          </div>
        </Space>
      ),
      sorter: true,
      sortOrder: filters.sortBy === 'firstName' ? 
        (filters.sortDirection === 'asc' ? 'ascend' : 'descend') as SortOrder : undefined,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      sortOrder: filters.sortBy === 'email' ? 
        (filters.sortDirection === 'asc' ? 'ascend' : 'descend') as SortOrder : undefined,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>
          {role}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: UserRole.ADMIN },
        { text: 'Manager', value: UserRole.MANAGER },
        { text: 'User', value: UserRole.USER },
      ],
      filteredValue: filters.role ? [filters.role] : null,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: UserStatus.ACTIVE },
        { text: 'Inactive', value: UserStatus.INACTIVE },
        { text: 'Suspended', value: UserStatus.SUSPENDED },
      ],
      filteredValue: filters.status ? [filters.status] : null,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date?: string) => (date ? new Date(date).toLocaleDateString() : 'Never'),
      sorter: true,
      sortOrder: filters.sortBy === 'lastLogin' ? 
        (filters.sortDirection === 'asc' ? 'ascend' : 'descend') as SortOrder : undefined,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date?: string) => (date ? new Date(date).toLocaleDateString() : '-'),
      sorter: true,
      sortOrder: filters.sortBy === 'createdAt' ? 
        (filters.sortDirection === 'asc' ? 'ascend' : 'descend') as SortOrder : undefined,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="Edit User">
            <TTButton
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          
          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <TTButton
              type="text"
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedUserIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      onSelectionChange(selectedRowKeys as string[]);
    },
  };

  const handleTableChange = (paginationInfo: any, filtersInfo: any, sorter: any) => {
    const newFilters = { ...filters };

    // Handle pagination
    if (paginationInfo.current !== pagination.current) {
      newFilters.page = paginationInfo.current - 1;
    }
    if (paginationInfo.pageSize !== pagination.pageSize) {
      newFilters.size = paginationInfo.pageSize;
      newFilters.page = 0; // Reset to first page when changing page size
    }

    // Handle sorting
    if (sorter.field) {
      newFilters.sortBy = sorter.field;
      newFilters.sortDirection = sorter.order === 'ascend' ? 'asc' : 'desc';
    } else {
      delete newFilters.sortBy;
      delete newFilters.sortDirection;
    }

    // Handle filters
    if (filtersInfo.role) {
      newFilters.role = filtersInfo.role[0];
    } else {
      delete newFilters.role;
    }

    if (filtersInfo.status) {
      newFilters.status = filtersInfo.status[0];
    } else {
      delete newFilters.status;
    }

    onFiltersChange(newFilters);
  };

  return (
    <TTTable
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={loading}
      rowSelection={rowSelection}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} users`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onChange={handleTableChange}
      scroll={{ x: 800 }}
    />
  );
};

export default UserTable;
