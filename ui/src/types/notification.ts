export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string; // ISO string
  read: boolean;
  archived?: boolean;
  // Optional metadata for extensibility
  type?: string;
  linkUrl?: string;
}
