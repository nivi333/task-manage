import React, { useEffect } from 'react';
import { Radio, Space, Typography } from 'antd';
import type { ThemeOption } from '../../types/settings';

interface Props {
  value?: ThemeOption;
  onChange?: (value: ThemeOption) => void;
}

const ThemeSelector: React.FC<Props> = ({ value = 'system', onChange }) => {
  // Apply theme to body for immediate feedback
  useEffect(() => {
    const cls = 'tt-theme-dark';
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effective: ThemeOption = value === 'system' ? (prefersDark ? 'dark' : 'light') : value;
    if (effective === 'dark') {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
  }, [value]);

  return (
    <Space direction="vertical" style={{ width: '100%', alignItems: 'flex-start' }}>
      <Typography.Text type="secondary">Choose your appearance preference</Typography.Text>
      <Radio.Group
        value={value}
        onChange={(e) => onChange?.(e.target.value as ThemeOption)}
      >
        <Space direction="vertical" align="start">
          <Radio value="system">System default</Radio>
          <Radio value="light">Light</Radio>
          <Radio value="dark">Dark</Radio>
        </Space>
      </Radio.Group>
    </Space>
  );
};

export default ThemeSelector;
