import React, { useState, useEffect, useCallback } from "react";
import { Card, Space, Modal } from "antd";
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import UserTable from "../components/admin/UserTable";
import UserFilters from "../components/admin/UserFilters";
import BulkActions from "../components/admin/BulkActions";
import UserModal from "../components/admin/UserModal";
import { TTButton, HeaderTitle } from "../components/common";
import {
  User,
  UserFilters as UserFiltersType,
  CreateUserRequest,
  UpdateUserRequest,
  BulkUserAction,
  UserStatus,
  UserListResponse,
} from "../types/user";
import { userService } from "../services/userService";
import AppLayout from "../components/layout/AppLayout";
const { confirm } = Modal;

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<UserFiltersType>({
    page: 0,
    size: 20,
    sortBy: "createdAt",
    sortDirection: "desc" as const,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response: UserListResponse = await userService.getUsers(filters);
      setUsers(response.users);
      setPagination((prev) => ({
        ...prev,
        current: response.currentPage + 1,
        pageSize: response.pageSize,
        total: response.totalElements,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
    setSelectedUserIds([]); // Clear selection when filters change
  };

  const handleClearFilters = () => {
    const clearedFilters: UserFiltersType = {
      page: 0,
      size: filters.size,
      sortBy: "createdAt",
      sortDirection: "desc",
    };
    setFilters(clearedFilters);
    setSelectedUserIds([]);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    const newFilters = {
      ...filters,
      page: page - 1,
      size: pageSize,
    };
    setFilters(newFilters);
    setSelectedUserIds([]);
  };

  const handleCreateUser = () => {
    setEditingUser(undefined);
    setUserModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserModalVisible(true);
  };

  const handleDeleteUser = (user: User) => {
    confirm({
      title: "Delete User",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete user "${user.firstName} ${user.lastName}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await userService.deleteUser(user.id);
          await fetchUsers();
          setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      },
    });
  };

  const handleStatusChange = async (user: User, status: UserStatus) => {
    try {
      await userService.updateUser(user.id, { status });
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleUserSubmit = async (
    userData: CreateUserRequest | UpdateUserRequest
  ) => {
    try {
      if (editingUser) {
        await userService.updateUser(
          editingUser.id,
          userData as UpdateUserRequest
        );
      } else {
        await userService.createUser(userData as CreateUserRequest);
      }
      setUserModalVisible(false);
      await fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleBulkAction = async (action: BulkUserAction) => {
    try {
      await userService.bulkAction(action);
      await fetchUsers();
      setSelectedUserIds([]);
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await userService.exportUsers(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting users:", error);
    }
  };

  return (
    <AppLayout
      title={<HeaderTitle level={3}>User Management</HeaderTitle>}
      contentPadding={0}
    >
      <div className="user-management-page">
        <div className="um-toolbar">
          <div className="um-toolbar-left">
            <UserFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              loading={loading}
            />
          </div>
          <div className="um-toolbar-right">
            <TTButton
              icon={<ExportOutlined />}
              onClick={handleExport}
              aria-label="Export CSV"
            />
            <TTButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateUser}
            >
              Add User
            </TTButton>
          </div>
        </div>
        <Card bordered={false}>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {selectedUserIds.length > 0 && (
              <div className="um-bulk-actions-row">
                <BulkActions
                  selectedUserIds={selectedUserIds}
                  onBulkAction={handleBulkAction}
                  loading={loading}
                />
              </div>
            )}

            <UserTable
              users={users}
              loading={loading}
              selectedUserIds={selectedUserIds}
              onSelectionChange={setSelectedUserIds}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onStatusChange={handleStatusChange}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: handlePaginationChange,
              }}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </Space>
        </Card>
        <UserModal
          visible={userModalVisible}
          user={editingUser}
          onCancel={() => setUserModalVisible(false)}
          onSubmit={handleUserSubmit}
          loading={loading}
        />
      </div>
    </AppLayout>
  );
};

export default UserManagementPage;
