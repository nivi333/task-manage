import React, { useEffect, useState } from 'react';
import { Drawer, Form, Button, Input, Select, DatePicker, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import taskService from 'services/taskService';
import { userService } from 'services/userService';
import { projectService } from 'services/projectService';
import { User } from 'types/user';
import { Project } from 'types/project';
import { Task } from 'types/task';

const { Option } = Select;

interface TaskFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onTaskSaved: () => void;
  task?: Task | null;
}

const TaskFormDrawer: React.FC<TaskFormDrawerProps> = ({ open, onClose, onTaskSaved, task }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [usersResponse, projectsResponse] = await Promise.all([
          userService.getUsersForTeams(),
          projectService.list(),
        ]);
        setUsers(usersResponse);
        setProjects(projectsResponse);
      } catch (error) {
        notification.error({ message: 'Failed to load users or projects.' });
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        ...task,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        assignedTo: task.assignedTo?.id,
        projectId: task.projectId,
      });
    } else {
      form.resetFields();
    }
  }, [task, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      };

      if (task) {
        await taskService.updateTask(task.id, payload);
        notification.success({ message: 'Task updated successfully!' });
      } else {
        await taskService.createTask(payload);
        notification.success({ message: 'Task created successfully!' });
      }
      onTaskSaved();
      onClose();
    } catch (error) {
      // Error is handled by the global notification service
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={task ? 'Edit Task' : 'Create Task'}
      width={720}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Button onClick={onClose} style={{ marginRight: 8 }}>
          Cancel
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter task title' }]}
        >
          <Input placeholder="Please enter task title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={4} placeholder="Please enter task description" />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: 'Please select a priority' }]}
        >
          <Select placeholder="Select a priority">
            <Option value="HIGH">High</Option>
            <Option value="MEDIUM">Medium</Option>
            <Option value="LOW">Low</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select placeholder="Select a status">
            <Option value="OPEN">Open</Option>
            <Option value="IN_PROGRESS">In Progress</Option>
            <Option value="DONE">Done</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="Due Date"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="assignedTo"
          label="Assigned To"
        >
          <Select placeholder="Assign to a user">
            {users.map(user => (
              <Option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="projectId"
          label="Project"
        >
          <Select placeholder="Select a project">
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Button onClick={() => form.submit()} type="primary" loading={loading}>
            Submit
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default TaskFormDrawer;
