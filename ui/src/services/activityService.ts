import apiClient from './authService';

export interface ActivityLogItem {
  id: string;
  action: string;
  details?: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  user?: { id: string; username?: string };
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const activityService = {
  async listForTask(taskId: string, page = 0, size = 20): Promise<Page<ActivityLogItem>> {
    const params = new URLSearchParams({ entityType: 'TASK', entityId: taskId, page: String(page), size: String(size) });
    const { data } = await apiClient.get(`/activities?${params.toString()}`);
    return data;
  },
  async listForUser(username: string, page = 0, size = 20): Promise<Page<ActivityLogItem>> {
    const params = new URLSearchParams({ user: username, page: String(page), size: String(size) });
    const { data } = await apiClient.get(`/activities?${params.toString()}`);
    return data;
  },
};
