import React, { useEffect, useMemo, useState } from 'react';
import { Card, Form, Switch, Select, Checkbox, Space, Typography, Spin } from 'antd';
import AppLayout from '../components/layout/AppLayout';
import { HeaderTitle } from '../components/common';
import { authAPI } from '../services/authService';
import notificationPreferencesService from '../services/notificationPreferencesService';
import { BatchFrequency, NotificationPreferences, NotificationTypeKey } from '../types/notificationPreferences';

const ALL_TYPES: { label: string; value: NotificationTypeKey }[] = [
  { label: 'Task Assigned', value: 'TASK_ASSIGNED' },
  { label: 'Task Updated', value: 'TASK_UPDATED' },
  { label: 'Comment Added', value: 'COMMENT_ADDED' },
  { label: 'Mention', value: 'MENTION' },
  { label: 'Project Updated', value: 'PROJECT_UPDATED' },
];

const NotificationPreferencesPage: React.FC = () => {
  const [form] = Form.useForm<NotificationPreferences>();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!authAPI.isAuthenticated()) {
          if (mounted) setLoading(false);
          return;
        }
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
      } catch (e) {
        // error surfaced globally via interceptor
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
  };

  const content = useMemo(() => {
    if (loading) return <div style={{ textAlign: 'center', margin: '48px 0' }}><Spin size="large" /></div>;
    return (
      <Card>
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
              { label: 'Hourly', value: 'HOURLY' },
              { label: 'Daily', value: 'DAILY' },
              { label: 'Weekly', value: 'WEEKLY' },
            ]} />
          </Form.Item>
          <Form.Item name="enabledTypes" label="Notification Types">
            <Checkbox.Group options={ALL_TYPES} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Form.Item noStyle shouldUpdate>
                {() => (
                  <button type="submit" className="tt-btn tt-btn-primary">Save Preferences</button>
                )}
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    );
  }, [loading, form, batchDisabled]);

  return (
    <AppLayout title={<HeaderTitle level={3}>Notification Preferences</HeaderTitle>} contentPadding={16}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Typography.Paragraph type="secondary">
          Configure how you’d like to receive notifications.
        </Typography.Paragraph>
        {content}
      </Space>
    </AppLayout>
  );
};

export default NotificationPreferencesPage;
