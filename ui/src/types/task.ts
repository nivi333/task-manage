export type UUID = string;

export interface Task {
  id: UUID;
  title: string;
  description?: string;
  status: string;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdBy?: UUID;
  assignedTo?: UUID;
  project: {
    id: UUID;
    name: string;
    description?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    ownerId?: UUID;
    teamMemberIds?: UUID[];
    createdAt?: string;
    updatedAt?: string;
  };
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // zero-based page index
}

export interface TaskListFilters {
  status?: string;
  priority?: TaskPriority;
  assignedTo?: UUID;
  projectId?: UUID;
  tags?: string[];
  search?: string;
  dueDateFrom?: string; // ISO 8601
  dueDateTo?: string;   // ISO 8601
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number; // zero-based
  size?: number;
}

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TaskCreateRequest {
  title: string;
  description?: string;
  dueDate?: string; // ISO 8601
  status: string;
  priority?: TaskPriority;
  assignedTo?: UUID;
  projectId?: UUID;
  tags?: string[];
  // Hours supported by backend DTO
  estimatedHours?: number;
  actualHours?: number;
  dependencyIds?: UUID[];
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE';
    interval?: number; // e.g., every 2 weeks
    count?: number;    // number of occurrences
  } | null;
}

export interface TaskUpdateRequest extends Partial<TaskCreateRequest> {
  status?: string;
}
