import React from 'react';
import { Tabs } from 'antd';
import AppLayout from '../components/layout/AppLayout';
import { HeaderTitle } from '../components/common';
import SystemStats from '../components/admin/SystemStats';
import UserAuditLog from '../components/admin/UserAuditLog';
import ConfigEditor from '../components/admin/ConfigEditor';

const AdminDashboardPage: React.FC = () => {
  return (
    <AppLayout title={<HeaderTitle level={3}>Administration</HeaderTitle>}>
      <Tabs
        defaultActiveKey="stats"
        items={[
          { key: 'stats', label: 'System Stats', children: <SystemStats /> },
          { key: 'audit', label: 'User Audit Logs', children: <UserAuditLog /> },
          { key: 'config', label: 'Configuration', children: <ConfigEditor /> },
        ]}
      />
    </AppLayout>
  );
};

export default AdminDashboardPage;
