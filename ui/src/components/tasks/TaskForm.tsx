import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Upload, FormInstance } from 'antd';
import { Task, TaskCreateDTO, TaskUpdateDTO } from '../../types/task';
import UserSelector from './UserSelector';
import TagInput from './TagInput';
import { projectService } from '../../services/projectService';
import { Project } from '../../types/project';

const { Option } = Select;
const { TextArea } = Input;

const availableTags = ['Frontend', 'Backend', 'Bug', 'Feature', 'Urgent']; // TODO: fetch from backend

interface TaskFormProps {
  form: FormInstance<TaskCreateDTO | TaskUpdateDTO>;
  onFinish: (values: TaskCreateDTO | TaskUpdateDTO) => void;
  initialValues?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ form, onFinish, initialValues }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectList = await projectService.list();
        setProjects(projectList);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, []);
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item
        name="projectId"
        label="Project"
        rules={[{ required: true, message: 'Please select a project!' }]}
      >
        <Select
          placeholder="Select project"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) => {
            const label = typeof option?.children === 'string' ? option.children : '';
            return label.toLowerCase().includes(input.toLowerCase());
          }}
        >
          {projects.map((project) => (
            <Option key={project.id} value={project.id}>{project.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Please input the title!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item name="status" label="Status" initialValue="OPEN">
        <Select>
          <Option value="OPEN">Open</Option>
          <Option value="IN_PROGRESS">In Progress</Option>
          <Option value="DONE">Done</Option>
        </Select>
      </Form.Item>
      <Form.Item name="priority" label="Priority" initialValue="MEDIUM" rules={[{ required: true, message: 'Please select a priority!' }]}> 
        <Select>
          <Option value="HIGH">High</Option>
          <Option value="MEDIUM">Medium</Option>
          <Option value="LOW">Low</Option>
        </Select>
      </Form.Item>
      <Form.Item name="dueDate" label="Due Date" rules={[{ type: 'object', required: false, message: 'Please select a valid due date!' }]}> 
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="assignedTo" label="Assignee">
        <UserSelector />
      </Form.Item>
      <Form.Item name="tags" label="Tags">
        <TagInput availableTags={availableTags} />
      </Form.Item>
      <Form.Item name="attachments" label="Attachments">
        <Upload multiple beforeUpload={() => false}>
          <Button>Upload Files</Button>
        </Upload>
        <div style={{ fontSize: 12, color: '#888' }}>(UI only; backend upload wiring TBD)</div>
      </Form.Item>
      <Form.Item name="dependencies" label="Dependencies">
        <Select mode="multiple" placeholder="Search tasks" disabled>
          {/* TODO: Implement task search and selection */}
        </Select>
        <div style={{ fontSize: 12, color: '#888' }}>(Coming soon)</div>
      </Form.Item>
      <Form.Item name="recurring" label="Recurring Options">
        <Select placeholder="Select frequency" disabled>
          <Option value="none">None</Option>
          <Option value="daily">Daily</Option>
          <Option value="weekly">Weekly</Option>
          <Option value="monthly">Monthly</Option>
        </Select>
        <div style={{ fontSize: 12, color: '#888' }}>(Coming soon)</div>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TaskForm;
