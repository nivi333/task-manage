export type NotificationTypeKey =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'COMMENT_ADDED'
  | 'MENTION'
  | 'PROJECT_UPDATED';

export type BatchFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY';

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  webEnabled: boolean;
  batchEnabled: boolean;
  batchFrequency?: BatchFrequency;
  enabledTypes: NotificationTypeKey[];
}
