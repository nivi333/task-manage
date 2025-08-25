import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Row, Col, Divider, Tabs } from 'antd';
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
    <Card bordered className="tt-card-flat">
      <Form<UserSettings> form={form} layout="vertical" onFinish={onFinish}>
        <Tabs
          items={[
            {
              key: 'profile',
              label: 'Profile',
              children: (
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name={["profile", "fullName"]} label="Full Name" rules={[{ required: true, message: 'Full name is required' }]}>
                      <Input placeholder="Your full name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={["profile", "displayName"]} label="Display Name">
                      <Input placeholder="Public display name (optional)" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={["profile", "timezone"]} label="Timezone">
                      <Input placeholder="e.g. Asia/Kolkata" />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'appearance',
              label: 'Appearance & Language',
              children: (
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name={["theme"]} label="Theme" rules={[{ required: true }]}>
                      <ThemeSelector />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={["language"]} label="Language" rules={[{ required: true }]}>
                      <LanguageSelector />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'notifications',
              label: 'Notifications',
              children: (
                <>
                  <NotificationSettings name="notifications" />
                </>
              ),
            },
          ]}
        />
        <Divider style={{ margin: '8px 0 0' }} />
      </Form>
      {/* Use AppLayout footer slot; page will pass actual footer */}
    </Card>
  );
};

export default SettingsForm;
