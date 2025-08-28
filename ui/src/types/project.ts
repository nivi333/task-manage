import { UUID } from './task';

export interface TeamMember {
  id: UUID;
  name: string;
  email?: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER' | string;
  avatarUrl?: string;
}

export interface TaskSummaryItem {
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | string;
  count: number;
}

export interface ActivityItem {
  id: UUID;
  type: string;
  message: string;
  createdAt: string; // ISO
  actor?: Pick<TeamMember, 'id' | 'name' | 'avatarUrl'>;
}

export interface Project {
  id: UUID;
  key?: string;
  name: string;
  description?: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  status?: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | string;
  owner?: TeamMember;
  members?: TeamMember[];
  // Backend may return only IDs instead of full member objects
  teamMemberIds?: UUID[];
  // Optional owning team reference for filtering/grouping in UI
  teamId?: UUID;
  // Optional aggregate metrics for progress indicators in list/grid
  metrics?: ProjectMetrics;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectCreateRequest {
  key?: string;
  name: string;
  description?: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  status?: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | string;
  memberIds?: UUID[];
}

export interface ProjectUpdateRequest {
  key?: string;
  name?: string;
  description?: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  status?: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | string;
  memberIds?: UUID[];
}

export interface ProjectMetrics {
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  overdueTasks: number;
  completionPercent: number; // 0-100
}

export interface BurndownPoint {
  date: string; // ISO date only
  remaining: number;
}

export interface ProjectDashboardData {
  project: Project;
  metrics: ProjectMetrics;
  taskSummary: TaskSummaryItem[];
  team: TeamMember[];
  recentActivity: ActivityItem[];
  timeline?: { date: string; label: string }[];
}

// Team management requests
export interface MemberInviteRequest {
  email: string;
  role?: 'MANAGER' | 'MEMBER';
}

export interface MemberRoleUpdateRequest {
  role: 'OWNER' | 'MANAGER' | 'MEMBER';
}
