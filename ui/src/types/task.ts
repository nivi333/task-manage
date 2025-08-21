import { User } from './user';

export type UUID = string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: User;
  projectId?: string;
  tags: string[];
  attachments?: any[];
  dependencies?: any[];
  subtasks?: any[];
}

export interface TaskCreateDTO {
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  assignedTo?: string; // UUID
  projectId?: string; // UUID
  tags?: string[];
}

export type TaskUpdateDTO = Partial<TaskCreateDTO>;
