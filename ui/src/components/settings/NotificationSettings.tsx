import React from 'react';
import { Form, Switch, Select, Checkbox, Row, Col, Typography, Space } from 'antd';
import type { NotificationPreferences } from '../../types/settings';
import type { BatchFrequency, NotificationTypeKey } from '../../types/notificationPreferences';

const ALL_TYPES: { label: string; value: NotificationTypeKey }[] = [
  { label: 'Task Assigned', value: 'TASK_ASSIGNED' },
  { label: 'Task Updated', value: 'TASK_UPDATED' },
  { label: 'Comment Added', value: 'COMMENT_ADDED' },
  { label: 'Mention', value: 'MENTION' },
  { label: 'Project Updated', value: 'PROJECT_UPDATED' },
];

interface Props {
  name: string;
}

const NotificationSettings: React.FC<Props> = ({ name }) => {
  const form = Form.useFormInstance<NotificationPreferences>();
  const batchEnabled = Form.useWatch([name, 'batchEnabled'], { form });
  const batchDisabled = batchEnabled === false;

  return (
      <Space direction="vertical" style={{ width: '100%', alignItems: 'flex-start' }}>
        <Typography.Text type="secondary">Configure how you’d like to receive notifications</Typography.Text>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Form.Item name={[name, 'emailEnabled']} valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
          <Typography.Text strong>Email Notifications</Typography.Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Form.Item name={[name, 'webEnabled']} valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
          <Typography.Text strong>Web Notifications</Typography.Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Form.Item name={[name, 'batchEnabled']} valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
          <Typography.Text strong>Batch Notifications</Typography.Text>
        </div>

        <Form.Item name={[name, 'batchFrequency']} label="Batch Frequency" style={{ width: 350, maxWidth: '100%' }} rules={[{ required: batchEnabled === true, message: 'Please select a frequency' }]}>
          <Select
            disabled={batchDisabled}
            options={[
              { label: 'Hourly', value: 'HOURLY' as BatchFrequency },
              { label: 'Daily', value: 'DAILY' as BatchFrequency },
              { label: 'Weekly', value: 'WEEKLY' as BatchFrequency },
            ]}
          />
        </Form.Item>

        <Form.Item name={[name, 'enabledTypes']} label="Notification Types" rules={[{ required: true, message: 'Select at least one type' }]} style={{ width: '100%' }}>
          <Checkbox.Group style={{ width: '100%' }}>
            <Row gutter={[12, 8]}>
              {ALL_TYPES.map((opt) => (
                <Col xs={24} sm={12} md={12} lg={8} key={opt.value}>
                  <Checkbox value={opt.value}>{opt.label}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Space>
  );
};

export default NotificationSettings;
