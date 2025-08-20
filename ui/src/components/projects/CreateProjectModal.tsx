import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import { ProjectCreateRequest } from '../../types/project';

export interface CreateProjectModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (payload: ProjectCreateRequest) => Promise<void> | void;
}

const { RangePicker } = DatePicker;

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onCancel, onCreate }) => {
  const [form] = Form.useForm<ProjectCreateRequest & { dateRange?: [dayjs.Dayjs, dayjs.Dayjs] }>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: ProjectCreateRequest = {
        key: values.key?.trim() || undefined,
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        status: values.status || 'ACTIVE',
        startDate: values.dateRange?.[0]?.toISOString(),
        endDate: values.dateRange?.[1]?.toISOString(),
      };
      await onCreate(payload);
    } catch {
      // validation errors are shown by antd
    }
  };

  return (
    <Modal
      title="Create Project"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Create"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Project Key" name="key" tooltip="Short code like TT">
          <Input maxLength={12} placeholder="e.g. TT" />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter project name' }]}>
          <Input placeholder="Project name" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Optional description" />
        </Form.Item>
        <Form.Item label="Dates" name="dateRange">
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Status" name="status" initialValue="ACTIVE">
          <Select
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'On Hold', value: 'ON_HOLD' },
              { label: 'Completed', value: 'COMPLETED' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;
