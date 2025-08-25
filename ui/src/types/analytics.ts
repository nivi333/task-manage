export interface DateRange {
  from: string; // ISO
  to: string;   // ISO
}

export interface AnalyticsSummary {
  totalTasksCompleted: number;
  avgCycleTimeDays: number;
  activeProjects: number;
  openTasks: number;
}

export interface TimelinePoint {
  date: string; // ISO date
  tasksCompleted: number;
  tasksCreated?: number;
}

export interface TeamProductivityItem {
  teamId: string;
  teamName: string;
  tasksCompleted: number;
  avgCycleTimeDays: number;
}

export interface AnalyticsFilters {
  range: DateRange;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  timeline: TimelinePoint[];
  teamProductivity: TeamProductivityItem[];
}
