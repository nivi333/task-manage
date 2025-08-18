import React, { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, Select, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { Task, TaskCreateRequest, TaskPriority, TaskUpdateRequest, UUID } from '../../types/task';
import { userService } from '../../services/userService';
import { taskService } from '../../services/taskService';
import { notificationService } from '../../services/notificationService';

export type TaskFormValues = {
  title: string;
  description?: string;
  dueDate?: Dayjs;
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
}

const priorities: TaskPriority[] = ['HIGH', 'MEDIUM', 'LOW'];

const TaskForm: React.FC<TaskFormProps> = ({ mode, initialTask, onSubmit }) => {
  const [form] = Form.useForm<TaskFormValues>();
  const [saving, setSaving] = useState(false);
  const [assigneeOptions, setAssigneeOptions] = useState<{ label: string; value: UUID }[]>([]);
  const [depOptions, setDepOptions] = useState<{ label: string; value: UUID }[]>([]);
  const [attachments, setAttachments] = useState<UploadFile[]>([]);

  const initialValues: TaskFormValues = useMemo(() => ({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    dueDate: initialTask?.dueDate ? dayjs(initialTask.dueDate) : undefined,
    priority: initialTask?.priority as TaskPriority | undefined,
    assignedTo: initialTask?.assignedTo,
    projectId: initialTask?.projectId,
    tags: initialTask?.tags || [],
    dependencies: [],
    recurrence: null,
    attachments: [],
  }), [initialTask]);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  const handleSearchUsers = async (q: string) => {
    const list = await userService.getUsers({ search: q, size: 10 } as any);
    setAssigneeOptions(
      (list.users || []).map(u => ({ label: `${u.firstName} ${u.lastName} (${u.email})`, value: u.id! }))
    );
  };

  const handleSearchTasks = async (q: string) => {
    const tasks = await taskService.search(q);
    setDepOptions(tasks.map(t => ({ label: `${t.title}`, value: t.id })));
  };

  const toCreatePayload = (v: TaskFormValues): TaskCreateRequest => ({
    title: v.title,
    description: v.description,
    dueDate: v.dueDate ? v.dueDate.toISOString() : undefined,
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
    <Form form={form} layout="vertical" initialValues={initialValues}>
      <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}> 
        <Input placeholder="Task title" maxLength={120} />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Rich text editor placeholder" autoSize={{ minRows: 4, maxRows: 10 }} />
      </Form.Item>

      <Form.Item name="dueDate" label="Due Date">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="priority" label="Priority">
        <Select allowClear placeholder="Select priority">
          {priorities.map(p => (
            <Select.Option key={p} value={p}>{p}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="assignedTo" label="Assignee">
        <Select
          showSearch
          allowClear
          placeholder="Search users"
          onSearch={handleSearchUsers}
          filterOption={false}
          options={assigneeOptions}
        />
      </Form.Item>

      <Form.Item name="tags" label="Tags">
        <Select mode="tags" placeholder="Add tags" tokenSeparators={[',']} />
      </Form.Item>

      <Form.Item name="dependencies" label="Dependencies">
        <Select
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
        <Input.Group compact>
          <Form.Item name={['recurrence','frequency']} noStyle>
            <Select style={{ width: '40%' }} defaultValue={'NONE'}>
              <Select.Option value="NONE">None</Select.Option>
              <Select.Option value="DAILY">Daily</Select.Option>
              <Select.Option value="WEEKLY">Weekly</Select.Option>
              <Select.Option value="MONTHLY">Monthly</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={['recurrence','interval']} noStyle>
            <Input style={{ width: '30%' }} type="number" min={1} placeholder="Interval" />
          </Form.Item>
          <Form.Item name={['recurrence','count']} noStyle>
            <Input style={{ width: '30%' }} type="number" min={1} placeholder="Count" />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item>
        <Button type="primary" onClick={submit} loading={saving}>
          {mode === 'create' ? 'Create Task' : 'Update Task'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TaskForm;
