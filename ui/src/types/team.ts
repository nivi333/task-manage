import { UUID } from 'types/task';

export interface Team {
  id: UUID;
  name: string;
  memberCount: number;
  description?: string;
}

export interface TeamMemberBrief {
  id: UUID;
  username: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER';
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
}

export interface TeamStatsSummary {
  totalMembers: number;
  activeProjects: number;
  tasksOpen: number;
  tasksInProgress: number;
  tasksDone: number;
}

export interface TeamActivityItem {
  id: UUID;
  timestamp: string; // ISO
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'COMMENT_ADDED' | 'MEMBER_JOINED' | 'MEMBER_LEFT' | 'PROJECT_CREATED';
  message: string;
  actor?: { id: UUID; username: string; avatarUrl?: string };
}
