import React from 'react';
import { Button, Dropdown, Space, Modal, Typography } from 'antd';
import { 
  DeleteOutlined, 
  CheckCircleOutlined, 
  StopOutlined, 
  ExclamationCircleOutlined,
  DownOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { BulkUserAction } from '../../types/user';

const { Text } = Typography;
const { confirm } = Modal;

interface BulkActionsProps {
  selectedUserIds: string[];
  onBulkAction: (action: BulkUserAction) => void;
  onExport: () => void;
  loading?: boolean;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedUserIds,
  onBulkAction,
  onExport,
  loading = false
}) => {
  const selectedCount = selectedUserIds.length;

  const handleBulkAction = (actionType: BulkUserAction['action'], actionLabel: string) => {
    confirm({
      title: `${actionLabel} Users`,
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to ${actionLabel.toLowerCase()} ${selectedCount} selected user${selectedCount > 1 ? 's' : ''}?`,
      okText: actionLabel,
      okType: actionType === 'delete' ? 'danger' : 'primary',
      cancelText: 'Cancel',
      onOk() {
        onBulkAction({
          userIds: selectedUserIds,
          action: actionType
        });
      },
    });
  };

  const bulkMenuItems = [
    {
      key: 'activate',
      label: (
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          Activate Users
        </Space>
      ),
      onClick: () => handleBulkAction('activate', 'Activate'),
    },
    {
      key: 'deactivate',
      label: (
        <Space>
          <StopOutlined style={{ color: '#faad14' }} />
          Deactivate Users
        </Space>
      ),
      onClick: () => handleBulkAction('deactivate', 'Deactivate'),
    },
    {
      key: 'suspend',
      label: (
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          Suspend Users
        </Space>
      ),
      onClick: () => handleBulkAction('suspend', 'Suspend'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      label: (
        <Space>
          <DeleteOutlined style={{ color: '#ff4d4f' }} />
          Delete Users
        </Space>
      ),
      onClick: () => handleBulkAction('delete', 'Delete'),
    },
  ];

  return (
    <div className="bulk-actions">
      <Space>
        {selectedCount > 0 && (
          <>
            <Text type="secondary">
              {selectedCount} user{selectedCount > 1 ? 's' : ''} selected
            </Text>
            
            <Dropdown
              menu={{ items: bulkMenuItems }}
              disabled={loading}
              trigger={['click']}
            >
              <Button>
                Bulk Actions <DownOutlined />
              </Button>
            </Dropdown>
          </>
        )}
        
        <Button
          icon={<ExportOutlined />}
          onClick={onExport}
          disabled={loading}
        >
          Export CSV
        </Button>
      </Space>
    </div>
  );
};

export default BulkActions;
