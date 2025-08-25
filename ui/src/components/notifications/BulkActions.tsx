import React from 'react';
import { Button, Popconfirm, Space } from 'antd';

interface BulkActionsProps {
  selectedCount: number;
  onBulkMarkRead: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({ selectedCount, onBulkMarkRead, onBulkArchive, onBulkDelete }) => {
  const disabled = selectedCount === 0;
  return (
    <Space>
      <Button disabled={disabled} onClick={onBulkMarkRead}>Mark as Read</Button>
      <Button disabled={disabled} onClick={onBulkArchive}>Archive</Button>
      <Popconfirm title={`Delete ${selectedCount} notification(s)?`} onConfirm={onBulkDelete}>
        <Button danger disabled={disabled}>Delete</Button>
      </Popconfirm>
    </Space>
  );
};

export default BulkActions;
