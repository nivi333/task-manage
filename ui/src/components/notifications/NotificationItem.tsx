import React from 'react';
import { Badge, Button, Card, Space, Tag, Typography } from 'antd';
import { Notification } from 'types/notification';

interface NotificationItemProps {
  item: Notification;
  onMarkRead: (id: string, read: boolean) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ item, onMarkRead, onArchive, onDelete }) => {
  const statusTags = (
    <Space size={6} wrap>
      {!item.read && <Tag color="blue">Unread</Tag>}
      {item.archived && <Tag>Archived</Tag>}
    </Space>
  );
  return (
    <Badge dot={!item.read} offset={[0, 8]}>
      <Card size="small" style={{ marginBottom: 8 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Typography.Text strong>{item.title}</Typography.Text>
            {statusTags}
          </Space>
          <Typography.Text type="secondary">{item.message}</Typography.Text>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Typography.Text type="secondary">{new Date(item.createdAt).toLocaleString()}</Typography.Text>
            <Space>
              <Button size="small" onClick={() => onMarkRead(item.id, !item.read)}>
                {item.read ? 'Mark Unread' : 'Mark Read'}
              </Button>
              <Button size="small" onClick={() => onArchive(item.id)} disabled={!!item.archived}>
                Archive
              </Button>
              <Button size="small" danger onClick={() => onDelete(item.id)}>
                Delete
              </Button>
            </Space>
          </Space>
        </Space>
      </Card>
    </Badge>
  );
};

export default NotificationItem;
