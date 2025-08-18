import React from 'react';
import { Input, Select, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { UserRole, UserStatus, UserFilters as UserFiltersType } from '../../types/user';

const { Option } = Select;

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined, page: 0 });
  };

  const handleRoleChange = (value: UserRole | undefined) => {
    onFiltersChange({ ...filters, role: value, page: 0 });
  };

  const handleStatusChange = (value: UserStatus | undefined) => {
    onFiltersChange({ ...filters, status: value, page: 0 });
  };

  const hasActiveFilters = filters.search || filters.role || filters.status;

  return (
    <div className="user-filters">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            disabled={loading}
          />
        </Col>
        
        <Col xs={12} sm={6} md={4} lg={3}>
          <Select
            placeholder="Role"
            value={filters.role}
            onChange={handleRoleChange}
            allowClear
            disabled={loading}
            style={{ width: '100%' }}
          >
            <Option value={UserRole.ADMIN}>Admin</Option>
            <Option value={UserRole.MANAGER}>Manager</Option>
            <Option value={UserRole.USER}>User</Option>
          </Select>
        </Col>
        
        <Col xs={12} sm={6} md={4} lg={3}>
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={handleStatusChange}
            allowClear
            disabled={loading}
            style={{ width: '100%' }}
          >
            <Option value={UserStatus.ACTIVE}>Active</Option>
            <Option value={UserStatus.INACTIVE}>Inactive</Option>
            <Option value={UserStatus.SUSPENDED}>Suspended</Option>
          </Select>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Space>
            <Button
              icon={<FilterOutlined />}
              disabled={loading}
            >
              Advanced Filters
            </Button>
            
            {hasActiveFilters && (
              <Button
                icon={<ClearOutlined />}
                onClick={onClearFilters}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default UserFilters;
