import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Row, Col, Divider, Typography, Switch, Select, Checkbox } from 'antd';
import type { FormInstance } from 'antd';
import settingsService from '../../services/settingsService';
import type { UserSettings } from '../../types/settings';
import ThemeSelector from './ThemeSelector';
import LanguageSelector from './LanguageSelector';
import NotificationSettings from './NotificationSettings';

interface SettingsFormProps {
  onFormReady?: (form: FormInstance<UserSettings>) => void;
}

const DEFAULTS: UserSettings = {
  theme: 'system',
  language: 'en',
  profile: {
    fullName: '',
    displayName: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  notifications: {
    emailEnabled: true,
    webEnabled: true,
    batchEnabled: false,
    enabledTypes: ['TASK_ASSIGNED', 'TASK_UPDATED', 'COMMENT_ADDED', 'MENTION', 'PROJECT_UPDATED'],
  },
};

const batchFrequencyOptions = [
  { label: 'Hourly', value: 'HOURLY' },
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
];

const notificationTypeOptions = [
  { label: 'Task Assigned', value: 'TASK_ASSIGNED' },
  { label: 'Task Updated', value: 'TASK_UPDATED' },
  { label: 'Comment Added', value: 'COMMENT_ADDED' },
  { label: 'Mention', value: 'MENTION' },
  { label: 'Project Updated', value: 'PROJECT_UPDATED' },
];

const SettingsForm: React.FC<SettingsFormProps> = ({ onFormReady }) => {
  const [form] = Form.useForm<UserSettings>();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<UserSettings>(DEFAULTS);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await settingsService.get();
        const merged: UserSettings = {
          ...DEFAULTS,
          ...data,
          profile: { ...DEFAULTS.profile, ...(data?.profile || {}) },
          notifications: { ...DEFAULTS.notifications, ...(data?.notifications || {}) },
        } as UserSettings;
        if (mounted) {
          setInitial(merged);
          form.setFieldsValue(merged);
        }
      } catch (e) {
        // Keep defaults on error
        form.setFieldsValue(DEFAULTS);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    onFormReady?.(form);
    return () => {
      mounted = false;
    };
  }, [form]);

  const onFinish = async (values: UserSettings) => {
    await settingsService.update(values);
  };

  return (
    <div style={{ background: 'var(--color-card-background)', borderRadius: 10, padding: '32px 40px', width: '100%' }}>
      <Form<UserSettings> form={form} layout="vertical" onFinish={onFinish} style={{ width: '100%' }}>
        <Typography.Title level={5} style={{ margin: 0, color: 'var(--color-text-secondary)', fontWeight: 600, textAlign: 'left' }}>Profile</Typography.Title>
        <Row gutter={16} justify="start" style={{ marginBottom: 0 }}>
          <Col xs={24} md={8}>
            <Form.Item name={["profile", "fullName"]} label="Full Name" rules={[{ required: true, message: 'Full name is required' }]}>
              <Input placeholder="Your full name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name={["profile", "displayName"]} label="Display Name">
              <Input placeholder="Public display name (optional)" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name={["profile", "timezone"]} label="Timezone">
              <Input placeholder="e.g. Asia/Kolkata" />
            </Form.Item>
          </Col>
        </Row>
        <Divider style={{ margin: '18px 0 16px' }} />
        <Typography.Title level={5} style={{ margin: 0, color: 'var(--color-text-secondary)', fontWeight: 600, textAlign: 'left' }}>Appearance & Language</Typography.Title>
        <Row gutter={16} justify="start" style={{ marginBottom: 0 }}>
          <Col xs={24} md={8}>
            <Form.Item name={["theme"]} label="Theme" rules={[{ required: true }]}>
              <ThemeSelector />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name={["language"]} label="Language" rules={[{ required: true }]}>
              <LanguageSelector />
            </Form.Item>
          </Col>
        </Row>
        <Divider style={{ margin: '18px 0 16px' }} />
        <Typography.Title level={5} style={{ margin: 0, color: 'var(--color-text-secondary)', fontWeight: 600, textAlign: 'left' }}>Notifications</Typography.Title>
        <NotificationSettings name="notifications" />
      </Form>
    </div>
  );
};

export default SettingsForm;
