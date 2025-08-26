import React, { useCallback, useRef, useState } from 'react';
import { Button, Space } from 'antd';
import AppLayout from '../components/layout/AppLayout';
import SettingsForm from '../components/settings/SettingsForm';
import type { FormInstance } from 'antd';
import type { UserSettings } from '../types/settings';

const SettingsPage: React.FC = () => {
  const formRef = useRef<FormInstance<UserSettings> | null>(null);
  const [, force] = useState(0);

  const handleFormReady = useCallback((form: FormInstance<UserSettings>) => {
    formRef.current = form;
  }, []);

  return (
    <AppLayout
      title="Settings"
      contentPadding={0}
      footer={
        <Space>
          <Button onClick={() => force((x) => x + 1)}>Reset</Button>
          <Button type="primary" onClick={() => formRef.current?.submit()}>
            Save Changes
          </Button>
        </Space>
      }
    >
      {/* remount form to reset */}
      <div className="tt-settings" style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <SettingsForm key={`settings-form-${String((Math.random() * 1e6) | 0)}`} onFormReady={handleFormReady} />
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
