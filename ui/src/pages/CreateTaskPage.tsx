import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Button,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
} from "antd";
import { useNavigate } from "react-router-dom";
import AppLayout from "components/layout/AppLayout";
import { HeaderTitle } from "components/common";
import taskService from "services/taskService";
import { userService } from "services/userService";
import { projectService } from "services/projectService";
import { User } from "../types/user";
import { Project } from "../types/project";
import { notification } from "antd";

const { Option } = Select;

const CreateTaskPage: React.FC = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
    const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersResponse, projectsResponse] = await Promise.all([
          userService.getUsersForTeams(),
          projectService.list(),
        ]);
        setUsers(usersResponse);
        setProjects(projectsResponse);
      } catch (error) {
        // Errors are handled by notification service
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleClose = () => {
    setOpen(false);
    navigate("/tasks");
  };

  const onFinish = async (values: any) => {
    try {
      const taskData = {
        ...values,
        description: values.description ?? '',
        tags: values.tags ?? [],
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      };
      await taskService.createTask(taskData);
      notification.success({ message: "Task created successfully!" });
      handleClose();
    } catch (error) {
      // Error is already handled by the notification service in the API client
    }
  };

  return (
    <AppLayout title={<HeaderTitle level={3}>Tasks</HeaderTitle>}>
      <Drawer
        title="Create Task"
        width="40%"
        onClose={handleClose}
        open={open}
        styles={{
          body: { padding: 0, paddingBottom: 80 },
        }}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button onClick={handleClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button onClick={() => form.submit()} type="primary">
              Create
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ description: '', tags: [], dueDate: null, estimatedHours: null }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: "Please enter task title" }]}
              >
                <Input placeholder="Please enter task title" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea
                  rows={4}
                  placeholder="Please enter task description"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select a status" }]}
              >
                <Select placeholder="Please select a status">
                  <Option value="OPEN">Open</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="DONE">Done</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[
                  { required: true, message: "Please select a priority" },
                ]}
              >
                <Select placeholder="Please select a priority">
                  <Option value="LOW">Low</Option>
                  <Option value="MEDIUM">Medium</Option>
                  <Option value="HIGH">High</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignedTo"
                label="Assigned To"
                rules={[{ required: true, message: "Please assign a user" }]}
              >
                <Select placeholder="Select a user" loading={loading}>
                  {users.map((user) => (
                    <Option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.username})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="Project"
                rules={[{ required: true, message: "Please select a project" }]}
              >
                <Select placeholder="Select a project" loading={loading}>
                  {projects.map((project) => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dueDate" label="Due Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="estimatedHours" label="Estimated Hours">
                <InputNumber style={{ width: "100%" }} placeholder="e.g., 8" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="tags" label="Tags">
                <Select
                  mode="tags"
                  style={{ width: "100%" }}
                  placeholder="Add tags"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </AppLayout>
  );
};

export default CreateTaskPage;
