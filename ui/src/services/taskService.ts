import apiClient from './authService';
import { Task, TaskCreateDTO, TaskUpdateDTO } from '../types/task';
import { notificationService } from './notificationService';

const API_URL = '/tasks';

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  projectId?: string;
  dueDate?: string; 
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  tags?: string[];
}

const getTasks = async (filters: TaskFilters = {}): Promise<Task[]> => {
  try {
    const response = await apiClient.get<any>(API_URL, { params: filters });
    const data = response.data as any;
    // Normalize: support both pageable { content: [...] } and direct array responses
    if (Array.isArray(data)) return data as Task[];
    if (data && Array.isArray(data.content)) return data.content as Task[];
    return [] as Task[];
  } catch (error) {
    notificationService.error('Failed to fetch tasks.');
    throw error;
  }
};

const getTaskById = async (id: string): Promise<Task> => {
  try {
    const response = await apiClient.get<Task>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    notificationService.error('Failed to fetch task details.');
    throw error;
  }
};

const createTask = async (taskData: TaskCreateDTO): Promise<Task> => {
  try {
    const response = await apiClient.post<Task>(API_URL, taskData);
    notificationService.success('Task created successfully!');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateTask = async (id: string, taskData: TaskUpdateDTO): Promise<Task> => {
  try {
    const response = await apiClient.put<Task>(`${API_URL}/${id}`, taskData);
    notificationService.success('Task updated successfully!');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Explicit status move helper for drag & drop to guarantee payload format
const moveTaskStatus = async (
  id: string,
  status: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DONE'
): Promise<Task> => {
  try {
    const payload = { status };
    // Use PATCH to dedicated status endpoint to avoid full TaskCreateDTO validation
    const response = await apiClient.patch<Task>(`${API_URL}/${id}/status`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteTask = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${API_URL}/${id}`);
    notificationService.success('Task deleted successfully!');
  } catch (error) {
    throw error;
  }
};

const taskService = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  moveTaskStatus,
  deleteTask,
};

export default taskService;
