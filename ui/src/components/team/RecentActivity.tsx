import React from 'react';
import { Card, List, Typography, Avatar, Tooltip } from 'antd';
import { TeamActivityItem } from '../../types/team';

interface Props {
  items: TeamActivityItem[];
}

const RecentActivity: React.FC<Props> = ({ items }) => {
  return (
    <Card className="card">
      <Typography.Title level={5} className="mb-sm">Recent Activity</Typography.Title>
      <List
        dataSource={items}
        locale={{ emptyText: 'No recent activity' }}
        renderItem={(it) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                it.actor ? (
                  <Avatar src={it.actor.avatarUrl} className="bg-primary">
                    {(!it.actor.avatarUrl && it.actor.username?.[0]?.toUpperCase()) || 'U'}
                  </Avatar>
                ) : (
                  <Avatar className="bg-primary">A</Avatar>
                )
              }
              title={
                <div className="flex-row justify-between align-center">
                  <Typography.Text>{it.message}</Typography.Text>
                  <Tooltip title={new Date(it.timestamp).toLocaleString()}>
                    <Typography.Text type="secondary" className="ml-sm">
                      {new Date(it.timestamp).toLocaleDateString()}
                    </Typography.Text>
                  </Tooltip>
                </div>
              }
              description={<Typography.Text type="secondary">{it.type}</Typography.Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RecentActivity;
