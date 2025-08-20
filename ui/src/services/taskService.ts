import apiClient from './authService';
import { PageResponse, Task, TaskListFilters, UUID, TaskCreateRequest, TaskUpdateRequest } from '../types/task';

const toQuery = (filters: TaskListFilters = {}): string => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
  if (filters.projectId) params.append('projectId', filters.projectId);
  if (filters.tags && filters.tags.length) filters.tags.forEach(t => params.append('tags', t));
  if (filters.search) params.append('search', filters.search);
  if (filters.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom);
  if (filters.dueDateTo) params.append('dueDateTo', filters.dueDateTo);
  params.append('sortBy', filters.sortBy || 'createdAt');
  params.append('sortDir', filters.sortDir || 'desc');
  params.append('page', String(filters.page ?? 0));
  params.append('size', String(filters.size ?? 10));
  return params.toString();
};

export const taskService = {
  async list(filters: TaskListFilters = {}): Promise<PageResponse<Task>> {
    const q = toQuery(filters);
    try {
      const { data } = await apiClient.get(`/tasks?${q}`);
      return data;
    } catch (e: any) {
      // Similar to projects: some backends restrict `/tasks` globally; try a user-scoped endpoint.
      if (e?.response?.status === 403) {
        try {
          const { data } = await apiClient.get(`/tasks/my?${q}`);
          return data;
        } catch (e2: any) {
          const code = e2?.response?.status;
          if (code === 403 || code === 404) {
            // Return an empty page to avoid uncaught runtime errors in the UI.
            return {
              content: [],
              totalElements: 0,
              totalPages: 0,
              size: Number(filters.size ?? 10),
              number: Number(filters.page ?? 0),
            };
          }
          // Otherwise rethrow original error
          throw e;
        }
      }
      throw e;
    }
  },
  async get(id: UUID): Promise<Task> {
    const { data } = await apiClient.get(`/tasks/${id}`);
    return data;
  },
  async create(payload: TaskCreateRequest): Promise<Task> {
    const { data } = await apiClient.post(`/tasks`, payload);
    return data;
  },
  async update(id: UUID, payload: TaskUpdateRequest): Promise<Task> {
    const { data } = await apiClient.put(`/tasks/${id}`, payload);
    return data;
  },
  async search(query: string): Promise<Task[]> {
    const { data } = await apiClient.get(`/tasks?search=${encodeURIComponent(query)}&size=10`);
    return data?.content ?? [];
  },
};
