import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Space, Typography } from 'antd';
import { adminService, SystemConfigDTO } from '../../services/adminService';
import { notificationService } from '../../services/notificationService';
import { authAPI } from '../../services/authService';

const { Text } = Typography;

const ConfigEditor: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [raw, setRaw] = useState<string>('{}');
  const [lastSaved, setLastSaved] = useState<SystemConfigDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cfg = await adminService.getConfig('global');
        if (cfg?.jsonValue) {
          setRaw(cfg.jsonValue);
          form.setFieldsValue({ json: cfg.jsonValue });
          setLastSaved(cfg);
        } else {
          form.setFieldsValue({ json: '{\n  "featureFlags": {},\n  "security": {"passwordMinLength": 8}\n}' });
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidJson = useMemo(() => {
    try {
      JSON.parse(raw || '{}');
      setError(null);
      return true;
    } catch (e: any) {
      setError(e?.message || 'Invalid JSON');
      return false;
    }
  }, [raw]);

  const onSave = async () => {
    if (!isValidJson) {
      notificationService.error('Please fix JSON errors before saving.');
      return;
    }
    setSaving(true);
    try {
      const actor = await authAPI.getCurrentUser().catch(() => null);
      const saved = await adminService.updateConfig('global', JSON.parse(raw), actor?.id);
      setLastSaved(saved);
      notificationService.success('Configuration saved');
    } catch (e) {
      // global interceptor shows errors, but add context
      notificationService.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const onFormat = () => {
    try {
      const pretty = JSON.stringify(JSON.parse(raw || '{}'), null, 2);
      setRaw(pretty);
      form.setFieldsValue({ json: pretty });
    } catch {}
  };

  return (
    <Card title="Configuration Editor" loading={loading}>
      <Form form={form} layout="vertical" onFinish={onSave} initialValues={{ json: raw }}>
        <Form.Item label={<Space><Text strong>JSON</Text>{!isValidJson && <Text type="danger">Invalid JSON</Text>}</Space>} name="json" rules={[{ required: true, message: 'JSON is required' }]}>
          <Input.TextArea
            rows={16}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Enter configuration JSON"
          />
        </Form.Item>
        {error && <div style={{ color: '#ff4d4f', marginBottom: 12 }}>{error}</div>}
        {lastSaved?.updatedAt && (
          <div style={{ marginBottom: 12, color: '#888' }}>Last saved: {new Date(lastSaved.updatedAt).toLocaleString()}</div>
        )}
        <Space>
          <Button type="primary" htmlType="submit" loading={saving} disabled={!isValidJson}>Save</Button>
          <Button onClick={onFormat}>Format</Button>
          <Button onClick={() => { setRaw('{}'); form.setFieldsValue({ json: '{}' }); }}>Reset</Button>
        </Space>
      </Form>
    </Card>
  );
};

export default ConfigEditor;
