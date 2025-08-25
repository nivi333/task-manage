import React from 'react';
import { Select, Typography, Space } from 'antd';
import type { LanguageOption } from '../../types/settings';

const LANGUAGE_OPTIONS: { label: string; value: LanguageOption }[] = [
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: 'हिंदी', value: 'hi' },
];

interface Props {
  value?: LanguageOption;
  onChange?: (value: LanguageOption) => void;
}

const LanguageSelector: React.FC<Props> = ({ value = 'en', onChange }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography.Text type="secondary">Select your preferred language</Typography.Text>
      <Select value={value} onChange={(v) => onChange?.(v as LanguageOption)} options={LANGUAGE_OPTIONS} />
    </Space>
  );
};

export default LanguageSelector;
