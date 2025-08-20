import React, { useEffect, useMemo, useState } from 'react';
import { DatePicker, Form, Input, InputNumber, Select, Space, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { Task, TaskCreateRequest, TaskPriority, TaskUpdateRequest, UUID } from '../../types/task';
import { userService } from '../../services/userService';
import { taskService } from '../../services/taskService';
import { notificationService } from '../../services/notificationService';
import { TTButton } from '../common';

export type TaskFormValues = {
  title: string;
  description?: string;
  dueDate?: Dayjs;
  status: string;
  priority?: TaskPriority;
  assignedTo?: UUID;
  projectId?: UUID;
  tags?: string[];
  dependencies?: { label: string; value: UUID }[];
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE';
    interval?: number;
    count?: number;
  } | null;
  attachments?: UploadFile[];
};

interface TaskFormProps {
  mode: 'create' | 'edit';
  initialTask?: Task;
  onSubmit?: (task: Task) => void;
  hideActions?: boolean;
  registerSubmit?: (fn: () => void) => void;
}

const priorities: TaskPriority[] = ['HIGH', 'MEDIUM', 'LOW'];

const TaskForm: React.FC<TaskFormProps> = ({ mode, initialTask, onSubmit, hideActions = false, registerSubmit }) => {
  const [form] = Form.useForm<TaskFormValues>();
  const [saving, setSaving] = useState(false);
  const [assigneeOptions, setAssigneeOptions] = useState<{ label: string; value: UUID }[]>([]);
  const [depOptions, setDepOptions] = useState<{ label: string; value: UUID }[]>([]);
  const [attachments, setAttachments] = useState<UploadFile[]>([]);

  const initialValues: TaskFormValues = useMemo(() => ({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    dueDate: initialTask?.dueDate ? dayjs(initialTask.dueDate) : undefined,
    status: initialTask?.status || 'OPEN',
    priority: initialTask?.priority as TaskPriority | undefined,
    assignedTo: initialTask?.assignedTo,
    projectId: initialTask?.projectId,
    tags: initialTask?.tags || [],
    dependencies: [],
    recurrence: { frequency: 'NONE', interval: undefined, count: undefined },
    attachments: [],
  }), [initialTask]);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  useEffect(() => {
    if (registerSubmit) {
      registerSubmit(submit);
    }
  }, [registerSubmit]);

  const handleSearchUsers = async (q: string) => {
    try {
      const list = await userService.getUsers({ search: q, size: 10 } as any);
      setAssigneeOptions(
        (list.users || []).map(u => ({ label: `${u.firstName} ${u.lastName} (${u.email})`, value: u.id! }))
      );
    } catch (e: any) {
      const code = e?.response?.status;
      if (code === 401) {
        notificationService.error('Your session expired. Please login again.');
      } else if (code === 403) {
        notificationService.info("You don't have permission to list users. Assigning is limited.");
      } else {
        notificationService.error('Failed to search users');
      }
      setAssigneeOptions([]);
    }
  };

  const handleSearchTasks = async (q: string) => {
    const tasks = await taskService.search(q);
    setDepOptions(tasks.map(t => ({ label: `${t.title}`, value: t.id })));
  };

  const toCreatePayload = (v: TaskFormValues): TaskCreateRequest => ({
    title: v.title,
    description: v.description,
    dueDate: v.dueDate ? v.dueDate.toISOString() : undefined,
    status: v.status,
    priority: v.priority,
    assignedTo: v.assignedTo,
    projectId: v.projectId,
    tags: v.tags,
    dependencyIds: (v.dependencies || []).map(d => d.value),
    recurrence: v.recurrence || null,
  });

  const toUpdatePayload = (v: TaskFormValues): TaskUpdateRequest => ({
    ...toCreatePayload(v),
  });

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      let result: Task;
      if (mode === 'create') {
        const createPayload = toCreatePayload(values);
        result = await taskService.create(createPayload);
        notificationService.success('Task created');
      } else {
        const updatePayload = toUpdatePayload(values);
        result = await taskService.update(initialTask!.id, updatePayload);
        notificationService.success('Task updated');
      }
      onSubmit?.(result);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save task';
      notificationService.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form form={form} layout="vertical" size="large" initialValues={initialValues}>
      <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
        * indicates required fields
      </div>
      <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}> 
        <Input size="large" placeholder="Task title" maxLength={120} />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[
          {
            validator: (_, value) => {
              const text = (value ?? '').toString();
              if (!text) return Promise.resolve();
              if (text.length > 5000) {
                return Promise.reject(new Error('Description must be 5000 characters or less.'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input.TextArea rows={6} placeholder="Write a description..." />
      </Form.Item>

      <Form.Item name="dueDate" label="Due Date">
        <DatePicker size="large" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Status is required' }]}> 
        <Select size="large" allowClear placeholder="Select status">
          <Select.Option value="OPEN">OPEN</Select.Option>
          <Select.Option value="IN_PROGRESS">IN_PROGRESS</Select.Option>
          <Select.Option value="DONE">DONE</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="priority" label="Priority" rules={[{ required: true, message: 'Priority is required' }]}> 
        <Select size="large" allowClear placeholder="Select priority">
          {priorities.map(p => (
            <Select.Option key={p} value={p}>{p}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="assignedTo" label="Assignee">
        <Select
          size="large"
          showSearch
          allowClear
          placeholder="Search users"
          onSearch={handleSearchUsers}
          filterOption={false}
          options={assigneeOptions}
        />
      </Form.Item>

      <Form.Item name="tags" label="Tags">
        <Select size="large" mode="tags" placeholder="Add tags" tokenSeparators={[',']} />
      </Form.Item>

      <Form.Item name="dependencies" label="Dependencies">
        <Select
          size="large"
          mode="multiple"
          showSearch
          allowClear
          placeholder="Search tasks to add"
          onSearch={handleSearchTasks}
          filterOption={false}
          labelInValue
          options={depOptions}
        />
      </Form.Item>

      <Form.Item label="Attachments">
        <Upload
          multiple
          beforeUpload={() => false}
          fileList={attachments}
          onChange={({ fileList }) => setAttachments(fileList)}
          listType="picture-card"
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
        <div style={{ color: '#999', fontSize: 12 }}>Files are kept client-side; attach support can be wired to backend multipart later.</div>
      </Form.Item>

      <Form.Item label="Recurrence">
        <Space.Compact block className="recurrence-compact">
          <Form.Item name={['recurrence','frequency']} noStyle>
            <Select size="large" style={{ flex: '0 0 40%' }}>
              <Select.Option value="NONE">None</Select.Option>
              <Select.Option value="DAILY">Daily</Select.Option>
              <Select.Option value="WEEKLY">Weekly</Select.Option>
              <Select.Option value="MONTHLY">Monthly</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={['recurrence','interval']} noStyle>
            <InputNumber size="large" min={1} placeholder="Interval" style={{ flex: '0 0 30%' }} />
          </Form.Item>
          <Form.Item name={['recurrence','count']} noStyle>
            <InputNumber size="large" min={1} placeholder="Count" style={{ flex: '0 0 30%' }} />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      {!hideActions && (
        <Form.Item>
          <TTButton type="primary" onClick={submit} loading={saving}>
            {mode === 'create' ? 'Create Task' : 'Update Task'}
          </TTButton>
        </Form.Item>
      )}
    </Form>
  );
};

export default TaskForm;
