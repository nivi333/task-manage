import React from 'react';
import { Avatar, Card, List, Space, Typography } from 'antd';
import { ActivityItem } from '../../types/project';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Props {
  items: ActivityItem[];
}

const ActivityFeed: React.FC<Props> = ({ items }) => {
  return (
    <Card title="Recent Activity">
      <List
        dataSource={items}
        renderItem={(a) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={a.actor?.avatarUrl} icon={<UserOutlined />} />}
              title={
                <Space>
                  <Text strong>{a.actor?.name || 'System'}</Text>
                  <Text type="secondary">{new Date(a.createdAt).toLocaleString()}</Text>
                </Space>
              }
              description={a.message}
            />
          </List.Item>
        )}
      />
      {items.length === 0 && (
        <div style={{ textAlign: 'center', color: '#999' }}>No recent activity</div>
      )}
    </Card>
  );
};

export default ActivityFeed;
