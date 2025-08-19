import apiClient from './authService';
import { UUID } from '../types/task';

export interface TimeTrackingEntry {
  id?: UUID;
  task: { id: UUID };
  startTime: string; // ISO
  endTime: string;   // ISO
  durationMinutes: number;
  user?: { id: UUID };
}

export const timeTrackingService = {
  async list(): Promise<TimeTrackingEntry[]> {
    const { data } = await apiClient.get('/task-time-tracking');
    return data || [];
  },
  async create(entry: TimeTrackingEntry): Promise<TimeTrackingEntry> {
    const { data } = await apiClient.post('/task-time-tracking', entry);
    return data;
  },
  async get(id: UUID): Promise<TimeTrackingEntry> {
    const { data } = await apiClient.get(`/task-time-tracking/${id}`);
    return data;
  },
  async remove(id: UUID): Promise<void> {
    await apiClient.delete(`/task-time-tracking/${id}`);
  },
};
