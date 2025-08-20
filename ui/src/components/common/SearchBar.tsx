import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  width?: number | string;
  allowClear?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  width = 240,
  allowClear = true,
}) => {
  return (
    <Input
      className="tt-search-input"
      allowClear={allowClear}
      placeholder={placeholder}
      prefix={<SearchOutlined />}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onPressEnter={(e) => onSearch?.((e.target as HTMLInputElement).value)}
      style={{ width }}
    />
  );
};

export default SearchBar;
