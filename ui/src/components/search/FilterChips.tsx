import React from 'react';
import { Space, Tag, Dropdown, MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { SearchEntityType, GlobalSearchFilters } from '../../types/search';

export interface FilterChipsProps {
  filters: GlobalSearchFilters;
  onChange: (next: GlobalSearchFilters) => void;
}

const ENTITY_OPTIONS: SearchEntityType[] = ['TASK', 'PROJECT', 'USER', 'COMMENT'];

const FilterChips: React.FC<FilterChipsProps> = ({ filters, onChange }) => {
  const { entityTypes = [], sortBy = 'relevance', sortOrder = 'desc' } = filters;

  const toggleEntity = (type: SearchEntityType) => {
    const set = new Set(entityTypes);
    if (set.has(type)) set.delete(type);
    else set.add(type);
    onChange({ ...filters, entityTypes: Array.from(set) });
  };

  const sortItems: MenuProps['items'] = [
    { key: 'relevance:desc', label: 'Relevance' },
    { key: 'updatedAt:desc', label: 'Last updated' },
    { key: 'createdAt:desc', label: 'Recently created' },
  ];

  const onSortClick: MenuProps['onClick'] = ({ key }) => {
    const [sb, so] = String(key).split(':');
    onChange({ ...filters, sortBy: sb as any, sortOrder: (so as any) ?? 'desc' });
  };

  return (
    <Space wrap>
      {ENTITY_OPTIONS.map((t) => (
        <Tag
          key={t}
          color={entityTypes.includes(t) ? 'blue' : undefined}
          onClick={() => toggleEntity(t)}
          style={{ cursor: 'pointer' }}
        >
          {t}
        </Tag>
      ))}
      <Dropdown menu={{ items: sortItems, onClick: onSortClick }} trigger={['click']}>
        <Tag color="default" style={{ cursor: 'pointer' }}>
          Sort: {sortBy}
          <DownOutlined style={{ marginLeft: 6 }} />
        </Tag>
      </Dropdown>
    </Space>
  );
};

export default FilterChips;
