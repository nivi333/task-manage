import apiClient from './authService';
import { UUID } from '../types/task';
import {
  BurndownPoint,
  Project,
  ProjectCreateRequest,
  ProjectDashboardData,
  ProjectUpdateRequest,
  TeamMember,
  MemberInviteRequest,
  MemberRoleUpdateRequest,
} from '../types/project';

export const projectService = {
  async list(): Promise<Project[]> {
    try {
      const { data } = await apiClient.get('/projects');
      return data;
    } catch (e: any) {
      // Some backends restrict `/projects` to admin-only. If forbidden, try a user-scoped endpoint.
      if (e?.response?.status === 403) {
        try {
          const { data } = await apiClient.get('/projects/my');
          return data;
        } catch (e2: any) {
          // If scoped endpoint also forbidden or not found, return empty list to avoid uncaught runtime errors
          const code = e2?.response?.status;
          if (code === 403 || code === 404) {
            return [];
          }
          // Otherwise rethrow the original error
          throw e;
        }
      }
      throw e;
    }
  },
  async get(id: UUID): Promise<Project> {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
  },
  async create(payload: ProjectCreateRequest): Promise<Project> {
    const { data } = await apiClient.post('/projects', payload);
    return data;
  },
  async update(id: UUID, payload: ProjectUpdateRequest): Promise<Project> {
    const { data } = await apiClient.put(`/projects/${id}`, payload);
    return data;
  },
  async bulkDelete(ids: UUID[]): Promise<void> {
    // If backend expects body: { ids: [...] } or query ?ids=, adjust accordingly
    await apiClient.delete('/projects', { data: { ids } });
  },
  async getDashboard(id: UUID): Promise<ProjectDashboardData> {
    const { data } = await apiClient.get(`/projects/${id}/dashboard`);
    return data;
  },
  async getBurndown(id: UUID): Promise<BurndownPoint[]> {
    const { data } = await apiClient.get(`/projects/${id}/analytics/burndown`);
    return data;
  },
  // Team management
  async listMembers(projectId: UUID): Promise<TeamMember[]> {
    const { data } = await apiClient.get(`/projects/${projectId}/members`);
    return data;
  },
  async inviteMember(projectId: UUID, payload: MemberInviteRequest): Promise<TeamMember> {
    const { data } = await apiClient.post(`/projects/${projectId}/members`, payload);
    return data;
  },
  async updateMemberRole(projectId: UUID, userId: UUID, payload: MemberRoleUpdateRequest): Promise<void> {
    await apiClient.patch(`/projects/${projectId}/members/${userId}/role`, payload);
  },
  async removeMember(projectId: UUID, userId: UUID): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },
};
