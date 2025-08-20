import React from 'react';
import { Dropdown as AntDropdown, DropdownProps } from 'antd';

/**
 * Global Dropdown component for consistent use across the app.
 * Wraps Ant Design Dropdown and applies global overrides if needed.
 */
export type GlobalDropdownProps = DropdownProps & {
  children: React.ReactNode;
};

const Dropdown: React.FC<GlobalDropdownProps> = ({ children, ...props }) => {
  return <AntDropdown {...props}>{children}</AntDropdown>;
};

export default Dropdown;
