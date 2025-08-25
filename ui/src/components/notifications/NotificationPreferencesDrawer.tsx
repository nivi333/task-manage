import React, { useEffect, useMemo, useState } from 'react';
import { Drawer, Form, Switch, Select, Checkbox, Space, Typography, Spin } from 'antd';
import { authAPI } from '../../services/authService';
import notificationPreferencesService from '../../services/notificationPreferencesService';
import { BatchFrequency, NotificationPreferences, NotificationTypeKey } from '../../types/notificationPreferences';

const ALL_TYPES: { label: string; value: NotificationTypeKey }[] = [
  { label: 'Task Assigned', value: 'TASK_ASSIGNED' },
  { label: 'Task Updated', value: 'TASK_UPDATED' },
  { label: 'Comment Added', value: 'COMMENT_ADDED' },
  { label: 'Mention', value: 'MENTION' },
  { label: 'Project Updated', value: 'PROJECT_UPDATED' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const NotificationPreferencesDrawer: React.FC<Props> = ({ open, onClose }) => {
  const [form] = Form.useForm<NotificationPreferences>();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await authAPI.getCurrentUser();
        const uid = user?.id || user?.userId || null;
        if (!uid) return;
        if (mounted) setUserId(uid);
        const existing = await notificationPreferencesService.get(uid);
        const initial: NotificationPreferences = existing ?? {
          userId: uid,
          emailEnabled: true,
          webEnabled: true,
          batchEnabled: false,
          batchFrequency: 'DAILY',
          enabledTypes: ALL_TYPES.map(t => t.value),
        };
        form.setFieldsValue(initial);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [form]);

  const batchDisabled = Form.useWatch('batchEnabled', form) === false;

  const onFinish = async (values: NotificationPreferences) => {
    if (!userId) return;
    const payload: NotificationPreferences = { ...values, userId };
    await notificationPreferencesService.update(payload);
    onClose();
  };

  const content = useMemo(() => {
    if (loading) return <div style={{ textAlign: 'center', margin: '48px 0' }}><Spin size="large" /></div>;
    return (
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="emailEnabled" label="Email Notifications" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="webEnabled" label="Web Notifications" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="batchEnabled" label="Batch Notifications" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="batchFrequency" label="Batch Frequency">
          <Select disabled={batchDisabled} options={[
            { label: 'Hourly', value: 'HOURLY' as BatchFrequency },
            { label: 'Daily', value: 'DAILY' as BatchFrequency },
            { label: 'Weekly', value: 'WEEKLY' as BatchFrequency },
          ]} />
        </Form.Item>
        <Form.Item name="enabledTypes" label="Notification Types">
          <Checkbox.Group options={ALL_TYPES} />
        </Form.Item>
        <Form.Item>
          <Space>
            <button type="submit" className="tt-btn tt-btn-primary">Save Preferences</button>
            <button type="button" className="tt-btn" onClick={onClose}>Cancel</button>
          </Space>
        </Form.Item>
      </Form>
    );
  }, [loading, form, batchDisabled, onClose]);

  return (
    <Drawer title="Notification Preferences" width={520} open={open} onClose={onClose} destroyOnClose>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        Configure how you’d like to receive notifications.
      </Typography.Paragraph>
      {content}
    </Drawer>
  );
};

export default NotificationPreferencesDrawer;
