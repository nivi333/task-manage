import apiClient from './authService';
import { UUID } from '../types/task';
import { Team, TeamMemberBrief, TeamStatsSummary, TeamActivityItem } from '../types/team';

export const teamService = {
  async list(): Promise<Team[]> {
    try {
      const { data } = await apiClient.get('/teams');
      return data;
    } catch (e: any) {
      // If forbidden or not found, return empty list to avoid uncaught runtime errors
      const code = e?.response?.status;
      if (code === 403 || code === 404) {
        return [];
      }
      throw e;
    }
  },
  async getTeam(id: UUID): Promise<Team> {
    const { data } = await apiClient.get(`/teams/${id}`);
    return data;
  },
  async createTeam(payload: Partial<Team>): Promise<Team> {
    const { data } = await apiClient.post(`/teams`, payload);
    return data;
  },
  async getMembers(id: UUID): Promise<TeamMemberBrief[]> {
    const { data } = await apiClient.get(`/teams/${id}/members`);
    return data;
  },
  async updateTeam(id: UUID, payload: Partial<Team>): Promise<Team> {
    const { data } = await apiClient.put(`/teams/${id}`, payload);
    return data;
  },
  async deleteTeam(id: UUID): Promise<void> {
    await apiClient.delete(`/teams/${id}`);
  },
  async addMember(id: UUID, user: { id?: UUID; username?: string; email?: string }): Promise<Team> {
    const { data } = await apiClient.post(`/teams/${id}/members`, user);
    return data;
  },
  async removeMember(id: UUID, userId: UUID): Promise<Team> {
    const { data } = await apiClient.delete(`/teams/${id}/members`, { params: { userId } });
    return data;
  },
  async getStats(id: UUID): Promise<TeamStatsSummary> {
    try {
      const { data } = await apiClient.get(`/teams/${id}/stats`);
      return data;
    } catch (e: any) {
      // If stats endpoint is not available, derive minimal stats from members
      try {
        const members = await this.getMembers(id);
        return {
          totalMembers: members.length,
          activeProjects: 0,
          tasksOpen: 0,
          tasksInProgress: 0,
          tasksDone: 0,
        };
      } catch {
        throw e;
      }
    }
  },
  async getRecentActivity(id: UUID): Promise<TeamActivityItem[]> {
    try {
      const { data } = await apiClient.get(`/teams/${id}/activity`);
      return data;
    } catch (e) {
      return [];
    }
  },
};
