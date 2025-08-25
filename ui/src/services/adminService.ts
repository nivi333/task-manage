import apiClient from './authService';

export interface AdminStatsDTO {
  users: number;
  projects: number;
  tasks: number;
  teams: number;
  comments: number;
  notifications: number;
}

export interface AuditLogItem {
  id: string;
  user?: { id: string; username?: string; firstName?: string; lastName?: string } | null;
  actor?: { id: string; username?: string; firstName?: string; lastName?: string } | null;
  action: string;
  details?: string;
  timestamp: string;
}

export interface SystemConfigDTO {
  id?: string;
  keyName: string;
  jsonValue: string; // stored JSON string
  updatedAt?: string;
  updatedBy?: { id: string; username?: string } | null;
}

export const adminService = {
  async getStats(): Promise<AdminStatsDTO> {
    const { data } = await apiClient.get('/admin/stats');
    return data;
  },
  async getAuditLogs(page = 0, size = 50): Promise<AuditLogItem[]> {
    const { data } = await apiClient.get(`/admin/audit-logs`, { params: { page, size } });
    return data || [];
  },
  async getConfig(key = 'global'): Promise<SystemConfigDTO | null> {
    const { data, status } = await apiClient.get(`/admin/config`, { params: { key } });
    return status === 204 ? null : data;
  },
  async updateConfig(key: string, json: Record<string, any>, actorId?: string): Promise<SystemConfigDTO> {
    const headers: Record<string, string> = {};
    if (actorId) headers['X-Actor-Id'] = actorId;
    const { data } = await apiClient.put(`/admin/config`, json, { params: { key }, headers });
    return data;
  },
};
