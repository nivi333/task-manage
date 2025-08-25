import React from 'react';
import { Tabs } from 'antd';

export type NotificationFilter = 'ALL' | 'UNREAD' | 'ARCHIVED';

interface FilterTabsProps {
  value: NotificationFilter;
  onChange: (key: NotificationFilter) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ value, onChange }) => {
  return (
    <Tabs
      activeKey={value}
      onChange={(k) => onChange(k as NotificationFilter)}
      items={[
        { key: 'ALL', label: 'All' },
        { key: 'UNREAD', label: 'Unread' },
        { key: 'ARCHIVED', label: 'Archived' },
      ]}
    />
  );
};

export default FilterTabs;
