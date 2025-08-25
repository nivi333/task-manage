import React from 'react';
import { Table, Button, Space, Tag, Badge } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { Notification } from 'types/notification';

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  selectedIds: React.Key[];
  onSelectionChange: (ids: React.Key[]) => void;
  onMarkRead: (id: string, read: boolean) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, loading, selectedIds, onSelectionChange, onMarkRead, onArchive, onDelete }) => {
  const columns: TableColumnsType<Notification> = [
    {
      title: 'Status',
      dataIndex: 'read',
      key: 'status',
      render: (_read: boolean, record) => (
        <Space>
          <Badge status={record.read ? 'default' : 'processing'} />
          {!record.read && <Tag color="blue">Unread</Tag>}
          {record.archived && <Tag>Archived</Tag>}
        </Space>
      ),
      width: 180,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => (
        record.linkUrl ? <a href={record.linkUrl}>{text}</a> : text
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString(),
      width: 200,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record) => (
        <Space>
          <Button size="small" onClick={() => onMarkRead(record.id, !record.read)}>
            {record.read ? 'Mark Unread' : 'Mark Read'}
          </Button>
          <Button size="small" onClick={() => onArchive(record.id)} disabled={!!record.archived}>
            Archive
          </Button>
          <Button size="small" danger onClick={() => onDelete(record.id)}>Delete</Button>
        </Space>
      ),
      width: 260,
    },
  ];

  const rowSelection: TableProps<Notification>["rowSelection"] = {
    selectedRowKeys: selectedIds,
    onChange: onSelectionChange,
  };

  return (
    <Table
      rowKey="id"
      dataSource={notifications}
      columns={columns}
      loading={loading}
      rowSelection={rowSelection}
      pagination={{ pageSize: 10, showSizeChanger: true }}
    />
  );
};

export default NotificationList;
