import React from 'react';
import { Card, Tag } from 'antd';
import { TTTable } from '../common';

const data = [
  { key: 'invite', permission: 'Invite Members', OWNER: true, MANAGER: true, MEMBER: false },
  { key: 'remove', permission: 'Remove Members', OWNER: true, MANAGER: true, MEMBER: false },
  { key: 'changeRole', permission: 'Change Roles', OWNER: true, MANAGER: true, MEMBER: false },
  { key: 'editProject', permission: 'Edit Project', OWNER: true, MANAGER: true, MEMBER: false },
  { key: 'view', permission: 'View Project', OWNER: true, MANAGER: true, MEMBER: true },
];

const columns = [
  { title: 'Permission', dataIndex: 'permission', key: 'permission' },
  { title: 'Owner', dataIndex: 'OWNER', key: 'OWNER', render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
  { title: 'Manager', dataIndex: 'MANAGER', key: 'MANAGER', render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
  { title: 'Member', dataIndex: 'MEMBER', key: 'MEMBER', render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
];

const PermissionMatrix: React.FC = () => {
  return (
    <Card title="Permissions">
      <TTTable
        size="small"
        columns={columns as any}
        dataSource={data}
        pagination={false}
        rowKey="key"
      />
    </Card>
  );
};

export default PermissionMatrix;
