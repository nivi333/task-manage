import React from 'react';
import { List, Button, Space, Typography } from 'antd';
import { SavedSearch } from '../../types/search';

interface SearchHistoryProps {
  items: SavedSearch[];
  loading?: boolean;
  onSelect: (item: SavedSearch) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ items, loading, onSelect }) => {
  return (
    <List
      size="small"
      loading={loading}
      dataSource={items}
      header={<Typography.Text strong>Saved Searches</Typography.Text>}
      renderItem={(it) => (
        <List.Item
          key={it.id || it.name}
          actions={[
            <Button key="use" type="link" onClick={() => onSelect(it)}>
              Use
            </Button>,
          ]}
        >
          <Space direction="vertical" size={0}>
            <Typography.Text>{it.name}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {it.query}
            </Typography.Text>
          </Space>
        </List.Item>
      )}
    />
  );
};

export default SearchHistory;
