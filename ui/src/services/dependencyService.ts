import apiClient from './authService';
import { UUID } from '../types/task';

export interface TaskRef { id: UUID; title?: string }
export interface TaskDependency {
  id: UUID;
  task: TaskRef;
  dependsOn: TaskRef;
}

export const dependencyService = {
  async list(): Promise<TaskDependency[]> {
    const { data } = await apiClient.get('/task-dependencies');
    return data || [];
  },
  async create(taskId: UUID, dependsOnId: UUID): Promise<TaskDependency> {
    const { data } = await apiClient.post('/task-dependencies', {
      task: { id: taskId },
      dependsOn: { id: dependsOnId },
    });
    return data;
  },
  async remove(id: UUID): Promise<void> {
    await apiClient.delete(`/task-dependencies/${id}`);
  },
};
