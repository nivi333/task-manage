import React, { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Form,
  Switch,
  Select,
  Checkbox,
  Space,
  Typography,
  Spin,
  Button,
  Row,
  Col,
} from "antd";
import { authAPI } from "../../services/authService";
import notificationPreferencesService from "../../services/notificationPreferencesService";
import {
  BatchFrequency,
  NotificationPreferences,
  NotificationTypeKey,
} from "../../types/notificationPreferences";

const ALL_TYPES: { label: string; value: NotificationTypeKey }[] = [
  { label: "Task Assigned", value: "TASK_ASSIGNED" },
  { label: "Task Updated", value: "TASK_UPDATED" },
  { label: "Comment Added", value: "COMMENT_ADDED" },
  { label: "Mention", value: "MENTION" },
  { label: "Project Updated", value: "PROJECT_UPDATED" },
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
          batchFrequency: "DAILY",
          enabledTypes: ALL_TYPES.map((t) => t.value),
        };
        form.setFieldsValue(initial);
      } catch (e) {
        // handled globally by interceptor
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [form]);

  const batchDisabled = Form.useWatch("batchEnabled", form) === false;

  const onFinish = async (values: NotificationPreferences) => {
    if (!userId) return;
    const payload: NotificationPreferences = { ...values, userId };
    await notificationPreferencesService.update(payload);
    onClose();
  };

  const content = useMemo(() => {
    if (loading)
      return (
        <div style={{ textAlign: "center", margin: "48px 0" }}>
          <Spin size="large" />
        </div>
      );
    return (
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Email Notifications toggle inline with title, perfectly aligned */}
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
        >
          <Typography.Text strong style={{ width: 220, marginRight: 12 }}>
            Email Notifications
          </Typography.Text>
          <Form.Item name="emailEnabled" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </div>

        {/* Web Notifications toggle inline with title, perfectly aligned */}
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
        >
          <Typography.Text strong style={{ width: 220, marginRight: 12 }}>
            Web Notifications
          </Typography.Text>
          <Form.Item name="webEnabled" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </div>

        {/* Batch Notifications toggle inline with title, perfectly aligned */}
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
        >
          <Typography.Text strong style={{ width: 220, marginRight: 12 }}>
            Batch Notifications
          </Typography.Text>
          <Form.Item name="batchEnabled" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </div>
        {/* Batch Frequency placed above Notification Types */}
        <Form.Item name="batchFrequency" label="Batch Frequency">
          <Select
            disabled={batchDisabled}
            options={[
              { label: "Hourly", value: "HOURLY" as BatchFrequency },
              { label: "Daily", value: "DAILY" as BatchFrequency },
              { label: "Weekly", value: "WEEKLY" as BatchFrequency },
            ]}
          />
        </Form.Item>

        {/* Notification Types in invisible grid */}
        <Form.Item name="enabledTypes" label="Notification Types">
          <Checkbox.Group>
            <Row gutter={[12, 8]}>
              {ALL_TYPES.map((opt) => (
                <Col xs={24} sm={12} md={12} lg={8} key={opt.value}>
                  <Checkbox value={opt.value}>{opt.label}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    );
  }, [loading, form, batchDisabled]);

  return (
    <Drawer
      title="Notification Preferences"
      width="40%"
      open={open}
      onClose={onClose}
      destroyOnClose
      bodyStyle={{ padding: 0, paddingBottom: 24 }}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()}>
            Save Preferences
          </Button>
        </div>
      }
    >
      <div style={{ padding: '24px 32px' }}>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
          Configure how you’d like to receive notifications.
        </Typography.Paragraph>
        {content}
      </div>
    </Drawer>
  );
};

export default NotificationPreferencesDrawer;
