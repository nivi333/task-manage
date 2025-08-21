import { User } from './user';

export interface Comment {
  id: string;
  content: string;
  author?: User;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  parentCommentId?: string | null;
  children?: Comment[];
}
