import React from 'react';
import { TTSelect } from '../common';

interface Props {
  value: 'OWNER' | 'MANAGER' | 'MEMBER';
  onChange: (role: 'OWNER' | 'MANAGER' | 'MEMBER') => void;
  disabled?: boolean;
}

const RoleSelector: React.FC<Props> = ({ value, onChange, disabled }) => {
  return (
    <TTSelect
      size="small"
      value={value}
      disabled={disabled}
      onChange={onChange}
      style={{ width: 140 }}
      options={[
        { value: 'OWNER', label: 'Owner' },
        { value: 'MANAGER', label: 'Manager' },
        { value: 'MEMBER', label: 'Member' },
      ]}
    />
  );
};

export default RoleSelector;
