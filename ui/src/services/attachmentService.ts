import apiClient from './authService';
import { UUID } from '../types/task';

export interface Attachment {
  id?: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  url: string;
  task?: { id: UUID };
  uploadedBy?: { id: string };
}

export const attachmentService = {
  async upload(file: File, taskId?: UUID): Promise<Attachment> {
    const form = new FormData();
    form.append('file', file);
    if (taskId) form.append('taskId', String(taskId));
    const { data } = await apiClient.post('/files/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async download(fileName: string): Promise<Blob> {
    const { data } = await apiClient.get(`/files/${encodeURIComponent(fileName)}`, { responseType: 'blob' as any });
    return data;
  },
  async remove(fileName: string): Promise<void> {
    await apiClient.delete(`/files/${encodeURIComponent(fileName)}`);
  },
};
