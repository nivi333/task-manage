import React from 'react';
import { Modal, Form, Input } from 'antd';
import { TTSelect } from '../common';

interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit: (email: string, role: 'MANAGER' | 'MEMBER') => void;
}

const InviteMemberModal: React.FC<Props> = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.email, values.role);
      form.resetFields();
    } catch {}
  };

  return (
    <Modal
      title="Invite Member"
      open={open}
      onCancel={() => { form.resetFields(); onCancel(); }}
      onOk={handleOk}
      okText="Invite"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="e.g. user@example.com" />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          initialValue="MEMBER"
          rules={[{ required: true, message: 'Role is required' }]}
        >
          <TTSelect
            options={[
              { value: 'MANAGER', label: 'Manager' },
              { value: 'MEMBER', label: 'Member' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InviteMemberModal;
