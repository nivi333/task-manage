import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Spin, Space, Typography, Button } from 'antd';
import AppLayout from '../components/layout/AppLayout';
import { HeaderTitle } from '../components/common';
import NotificationList from 'components/notifications/NotificationList';
import FilterTabs from 'components/notifications/FilterTabs';
import BulkActions from 'components/notifications/BulkActions';
import notificationsService, { NotificationFilter } from 'services/notificationsService';
import { Notification } from 'types/notification';
import { authAPI } from 'services/authService';
import { notificationService } from 'services/notificationService';
import { SettingOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import NotificationPreferencesDrawer from 'components/notifications/NotificationPreferencesDrawer';

const POLL_INTERVAL_MS = 30000;

const NotificationCenterPage: React.FC = () => {
  const [filter, setFilter] = useState<NotificationFilter>('ALL');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Load current user once to get userId
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await authAPI.getCurrentUser();
        if (mounted) setUserId(user?.id || user?.userId || null);
      } catch (e) {
        // handled by interceptor
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchNotifications = useCallback(async (showLoader: boolean = true) => {
    if (!userId) return;
    if (showLoader) setLoading(true);
    try {
      const list = await notificationsService.list(userId, filter);
      setNotifications(list);
    } catch (e) {
      // error surfaced by notificationService
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [userId, filter]);

  // Initial fetch + on filter change
  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  // Deep link support: /notifications?settings=1
  useEffect(() => {
    const shouldOpen = searchParams.get('settings') === '1';
    if (shouldOpen) setOpenSettings(true);
  }, [searchParams]);

  // Poll for real-time updates
  useEffect(() => {
    if (!userId) return;
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => fetchNotifications(false), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [userId, filter, fetchNotifications]);

  const onSelectionChange = (ids: React.Key[]) => setSelectedIds(ids);

  const handleMarkRead = async (id: string, read: boolean) => {
    try {
      await notificationsService.markRead(id, read);
      await fetchNotifications(false);
    } catch (e) {}
  };

  const handleArchive = async (id: string) => {
    try {
      await notificationsService.archive(id, true);
      notificationService.success('Notification archived');
      await fetchNotifications(false);
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsService.delete(id);
      notificationService.success('Notification deleted');
      await fetchNotifications(false);
    } catch (e) {}
  };

  const handleBulkMarkRead = async () => {
    try {
      await notificationsService.bulkMarkRead(selectedIds as string[]);
      setSelectedIds([]);
      notificationService.success('Marked selected as read');
      await fetchNotifications(false);
    } catch (e) {}
  };

  // Optional bulk helpers for archive/delete (not required by spec but supported by UI)
  const handleBulkArchive = useCallback(async () => {
    try {
      await Promise.all((selectedIds as string[]).map(id => notificationsService.archive(id, true)));
      setSelectedIds([]);
      notificationService.success('Archived selected notifications');
      await fetchNotifications(false);
    } catch (e) {}
  }, [selectedIds, fetchNotifications]);

  const handleBulkDelete = useCallback(async () => {
    try {
      await Promise.all((selectedIds as string[]).map(id => notificationsService.delete(id)));
      setSelectedIds([]);
      notificationService.success('Deleted selected notifications');
      await fetchNotifications(false);
    } catch (e) {}
  }, [selectedIds, fetchNotifications]);

  const content = useMemo(() => {
    if (loading) return <div style={{ textAlign: 'center', margin: '48px 0' }}><Spin size="large" /></div>;
    if (!loading && notifications.length === 0) return <Empty description="No notifications" />;
    return (
      <NotificationList
        notifications={notifications}
        loading={loading}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        onMarkRead={handleMarkRead}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
    );
  }, [loading, notifications, selectedIds]);

  return (
    <AppLayout
      title={<HeaderTitle level={3}>Notification Center</HeaderTitle>}
      contentPadding={16}
      footer={
        <Space>
          <Typography.Text type="secondary">Selected: {selectedIds.length}</Typography.Text>
          <BulkActions
            selectedCount={selectedIds.length}
            onBulkMarkRead={handleBulkMarkRead}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
          />
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FilterTabs value={filter} onChange={setFilter} />
          <Button icon={<SettingOutlined />} onClick={() => setOpenSettings(true)}>
            Preferences
          </Button>
        </div>
        {content}
      </Space>

      <NotificationPreferencesDrawer
        open={openSettings}
        onClose={() => {
          setOpenSettings(false);
          if (searchParams.get('settings') === '1') {
            searchParams.delete('settings');
            setSearchParams(searchParams, { replace: true });
          }
        }}
      />
    </AppLayout>
  );
};

export default NotificationCenterPage;
