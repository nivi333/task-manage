import apiClient from './authService';
import { notificationService } from './notificationService';
import { Notification } from 'types/notification';

export type NotificationFilter = 'ALL' | 'UNREAD' | 'ARCHIVED';

const BASE_URL = '/notifications';

const list = async (userId: string, filter: NotificationFilter = 'ALL'): Promise<Notification[]> => {
  try {
    const params: any = { userId };
    if (filter && filter !== 'ALL') params.status = filter;
    const res = await apiClient.get<any>(BASE_URL, { params });
    const data = res.data as any;
    if (Array.isArray(data)) return data as Notification[];
    if (data && Array.isArray(data.content)) return data.content as Notification[];
    return [] as Notification[];
  } catch (e) {
    notificationService.error('Failed to fetch notifications');
    throw e;
  }
};

const markRead = async (id: string, read: boolean = true): Promise<void> => {
  try {
    await apiClient.put(`${BASE_URL}/${id}/read`, { read });
  } catch (e) {
    throw e;
  }
};

const archive = async (id: string, archived: boolean = true): Promise<void> => {
  try {
    await apiClient.put(`${BASE_URL}/${id}/archive`, { archived });
  } catch (e) {
    throw e;
  }
};

const remove = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (e) {
    throw e;
  }
};

const bulkMarkRead = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => markRead(id, true)));
};

export const notificationsService = {
  list,
  markRead,
  archive,
  delete: remove,
  bulkMarkRead,
};

export default notificationsService;
