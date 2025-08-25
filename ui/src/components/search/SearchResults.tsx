import React from 'react';
import { List, Tag, Typography } from 'antd';
import { SearchResultItem } from '../../types/search';

interface SearchResultsProps {
  results: SearchResultItem[];
  loading?: boolean;
}

const typeColor: Record<string, string> = {
  TASK: 'blue',
  PROJECT: 'green',
  USER: 'purple',
  COMMENT: 'orange',
};

const SearchResults: React.FC<SearchResultsProps> = ({ results, loading }) => {
  return (
    <List
      loading={loading}
      itemLayout="vertical"
      dataSource={results}
      renderItem={(item) => (
        <List.Item key={`${item.type}-${item.id}`}>
          <List.Item.Meta
            title={
              <span>
                <Tag color={typeColor[item.type] || 'default'}>{item.type}</Tag>
                {item.url ? (
                  <a href={item.url}>{item.title}</a>
                ) : (
                  <Typography.Text strong>{item.title}</Typography.Text>
                )}
              </span>
            }
            description={item.snippet ? <Typography.Paragraph ellipsis={{ rows: 2 }}>{item.snippet}</Typography.Paragraph> : null}
          />
          {item.updatedAt && (
            <Typography.Text type="secondary">Updated: {new Date(item.updatedAt).toLocaleString()}</Typography.Text>
          )}
        </List.Item>
      )}
    />
  );
};

export default SearchResults;
