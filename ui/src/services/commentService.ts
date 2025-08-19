import apiClient from './authService';
import { UUID } from '../types/task';

export interface CommentModel {
  id?: UUID;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  authorId?: UUID;
  parentCommentId?: UUID | null;
}

export const commentService = {
  async list(taskId: UUID): Promise<CommentModel[]> {
    const { data } = await apiClient.get(`/tasks/${taskId}/comments`);
    return data || [];
  },
  async create(taskId: UUID, payload: { content: string; parentCommentId?: UUID | null }): Promise<CommentModel> {
    const params = payload.parentCommentId ? `?parentCommentId=${payload.parentCommentId}` : '';
    const { data } = await apiClient.post(`/tasks/${taskId}/comments${params}`, { content: payload.content });
    return data;
  },
  async update(taskId: UUID, commentId: UUID, content: string): Promise<CommentModel> {
    const { data } = await apiClient.put(`/tasks/${taskId}/comments/${commentId}`, content, {
      headers: { 'Content-Type': 'text/plain' },
    });
    return data;
  },
  async remove(taskId: UUID, commentId: UUID): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
  },
};
