import React from "react";
import { Space, Row, Col } from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";
import {
  UserRole,
  UserStatus,
  UserFilters as UserFiltersType,
} from "../../types/user";
import { SearchBar, TTSelect, TTButton } from "../common";

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
  loading = false,
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
    <div className="user-filters tt-filters">
      <Row gutter={[12, 0]} align="middle" wrap={false}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <SearchBar
            placeholder="Search users..."
            value={filters.search || ""}
            onChange={(val) => handleSearchChange(val)}
            allowClear
          />
        </Col>

        <Col xs={12} sm={6} md={4} lg={4}>
          <TTSelect
            placeholder="Role"
            value={filters.role}
            onChange={handleRoleChange}
            allowClear
            disabled={loading}
            style={{ width: "100%" }}
            options={[
              { label: "Admin", value: UserRole.ADMIN },
              { label: "Manager", value: UserRole.MANAGER },
              { label: "User", value: UserRole.USER },
            ]}
          />
        </Col>

        <Col xs={12} sm={6} md={4} lg={4}>
          <TTSelect
            placeholder="Status"
            value={filters.status}
            onChange={handleStatusChange}
            allowClear
            disabled={loading}
            style={{ width: "100%" }}
            options={[
              { label: "Active", value: UserStatus.ACTIVE },
              { label: "Inactive", value: UserStatus.INACTIVE },
              { label: "Suspended", value: UserStatus.SUSPENDED },
            ]}
          />
        </Col>
        <Col xs={12} sm={6} md={4} lg={4}>
          <TTButton
            className="tt-filters__btn"
            icon={<FilterOutlined />}
            disabled={loading}
          >
            Advanced Filters
          </TTButton>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Space>
            {hasActiveFilters && (
              <TTButton
                className="tt-filters__btn"
                icon={<ClearOutlined />}
                onClick={onClearFilters}
                disabled={loading}
              >
                Clear
              </TTButton>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default UserFilters;
