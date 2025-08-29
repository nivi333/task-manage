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
      return Array.isArray(data) ? data.map(normalizeProject) : [];
    } catch (e: any) {
      // Some backends restrict `/projects` to admin-only. If forbidden, try a user-scoped endpoint.
      if (e?.response?.status === 403) {
        try {
          const { data } = await apiClient.get('/projects/my');
          return Array.isArray(data) ? data.map(normalizeProject) : [];
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
    return normalizeProject(data);
  },
  async create(payload: ProjectCreateRequest): Promise<Project> {
    // Backend expects teamMemberIds; map from UI's memberIds.
    const backendPayload: any = { ...payload } as any;
    if ((payload as any).memberIds) {
      backendPayload.teamMemberIds = (payload as any).memberIds;
      delete backendPayload.memberIds;
    }
    const { data } = await apiClient.post('/projects', backendPayload);
    return normalizeProject(data);
  },
  async update(id: UUID, payload: ProjectUpdateRequest): Promise<Project> {
    const backendPayload: any = { ...payload, projectId: id } as any;
    if ((payload as any).memberIds) {
      backendPayload.teamMemberIds = (payload as any).memberIds;
      delete backendPayload.memberIds;
    }
    const { data } = await apiClient.put(`/projects/${id}`, backendPayload);
    return normalizeProject(data);
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

// --- Normalization helpers ---
function makeProjectKey(name?: string, fallback?: string): string | undefined {
  const source = (name || fallback || '').trim();
  if (!source) return undefined;
  // Build key from words' initials; allow letters+digits; max 5 chars
  const words = source
    .replace(/[^a-zA-Z0-9\s-]+/g, ' ') // strip symbols
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);
  if (words.length === 1) {
    // If single token, take first 5 alphanumerics
    return words[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
  }
  const initials = words.map(w => w[0]).join('').slice(0, 5).toUpperCase();
  return initials || undefined;
}

function normalizeProject(p: Project): Project {
  const name = (p.name || '').trim();
  const keyRaw = (p.key || '').trim();
  const key = keyRaw || makeProjectKey(name, p.id);
  const owner = p.owner
    ? { ...p.owner, name: (p.owner.name || 'Unknown Owner').trim() || 'Unknown Owner' }
    : p.owner;
  return { ...p, name, key, owner } as Project;
}
