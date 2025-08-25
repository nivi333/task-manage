import apiClient from './authService';
import { notificationService } from './notificationService';
import { AnalyticsFilters, AnalyticsResponse, AnalyticsSummary, TeamProductivityItem, TimelinePoint } from '../types/analytics';

const base = '/analytics';

export const getSummary = async (filters: AnalyticsFilters): Promise<AnalyticsSummary> => {
  try {
    const res = await apiClient.get<AnalyticsSummary>(`${base}/summary`, { params: filters.range });
    return res.data;
  } catch (e: any) {
    if (e?.response?.status === 404) {
      // Return an empty summary shape
      return { totalTasks: 0, activeProjects: 0, openTasks: 0 } as unknown as AnalyticsSummary;
    }
    notificationService.error('Failed to load analytics summary');
    throw e;
  }
};

export const getTimeline = async (filters: AnalyticsFilters): Promise<TimelinePoint[]> => {
  try {
    const res = await apiClient.get<TimelinePoint[]>(`${base}/timeline`, { params: filters.range });
    return Array.isArray(res.data) ? res.data : [];
  } catch (e: any) {
    if (e?.response?.status === 404) {
      return [];
    }
    notificationService.error('Failed to load timeline');
    throw e;
  }
};

export const getTeamProductivity = async (filters: AnalyticsFilters): Promise<TeamProductivityItem[]> => {
  try {
    const res = await apiClient.get<TeamProductivityItem[]>(`${base}/team-productivity`, { params: filters.range });
    return Array.isArray(res.data) ? res.data : [];
  } catch (e: any) {
    if (e?.response?.status === 404) {
      return [];
    }
    notificationService.error('Failed to load team productivity');
    throw e;
  }
};

const analyticsService = { getSummary, getTimeline, getTeamProductivity };
export default analyticsService;
