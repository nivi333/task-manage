import React, { useEffect } from "react";
import { Modal, Form, Input, Row, Col, Avatar, Upload } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
  UserStatus,
} from "../../types/user";
import { TTButton, TTSelect } from "../common";

interface UserModalProps {
  visible: boolean;
  user?: User;
  onCancel: () => void;
  onSubmit: (userData: CreateUserRequest | UpdateUserRequest) => void;
  loading?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({
  visible,
  user,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!user;

  useEffect(() => {
    if (visible) {
      if (user) {
        form.setFieldsValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
        });
      }
    }
  }, [visible, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEditing ? "Edit User" : "Create New User"}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <TTButton key="cancel" onClick={handleCancel} disabled={loading}>
          Cancel
        </TTButton>,
        <TTButton
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
        >
          {isEditing ? "Update User" : "Create User"}
        </TTButton>,
      ]}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        {isEditing && (
          <Row justify="center" style={{ marginBottom: 24 }}>
            <Col>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                src={user?.profilePicture}
              />
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <Upload showUploadList={false} beforeUpload={() => false}>
                  <TTButton type="text" size="small" icon={<UploadOutlined />}>
                    Change Photo
                  </TTButton>
                </Upload>
              </div>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[
                { required: true, message: "Please enter first name" },
                { min: 2, message: "First name must be at least 2 characters" },
              ]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[
                { required: true, message: "Please enter last name" },
                { min: 2, message: "Last name must be at least 2 characters" },
              ]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Username"
          name="username"
          rules={[
            { required: true, message: "Please enter username" },
            { min: 3, message: "Username must be at least 3 characters" },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message:
                "Username can only contain letters, numbers, and underscores",
            },
          ]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        {!isEditing && (
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <TTSelect
                placeholder="Select role"
                options={[
                  { label: "User", value: UserRole.USER },
                  { label: "Manager", value: UserRole.MANAGER },
                  { label: "Admin", value: UserRole.ADMIN },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <TTSelect
                placeholder="Select status"
                options={[
                  { label: "Active", value: UserStatus.ACTIVE },
                  { label: "Inactive", value: UserStatus.INACTIVE },
                  { label: "Suspended", value: UserStatus.SUSPENDED },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UserModal;
