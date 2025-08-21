import React from 'react';
import { Select } from 'antd';

interface TagInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  availableTags: string[];
}

const TagInput: React.FC<TagInputProps> = ({ value = [], onChange, availableTags }) => (
  <Select
    mode="tags"
    style={{ width: '100%' }}
    placeholder="Add tags"
    value={value}
    onChange={onChange}
    options={availableTags.map(tag => ({ label: tag, value: tag }))}
  />
);

export default TagInput;
