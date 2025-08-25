import apiClient from './authService';
import { notificationService } from './notificationService';
import type { UserSettings } from '../types/settings';

const API_URL = '/settings';

const DEFAULTS: UserSettings = {
  theme: 'system',
  language: 'en',
  profile: { fullName: '', displayName: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  notifications: { emailEnabled: true, webEnabled: true, batchEnabled: false, enabledTypes: ['TASK_ASSIGNED','TASK_UPDATED','COMMENT_ADDED','MENTION','PROJECT_UPDATED'] },
};

const get = async (): Promise<UserSettings> => {
  try {
    const res = await apiClient.get<UserSettings>(API_URL);
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // BE not implemented yet – return defaults silently
      return DEFAULTS;
    }
    notificationService.error('Failed to load settings.');
    throw error;
  }
};

const update = async (settings: UserSettings): Promise<UserSettings> => {
  try {
    const res = await apiClient.put<UserSettings>(API_URL, settings);
    notificationService.success('Settings saved successfully.');
    return res.data;
  } catch (error) {
    // Error notifications handled globally via interceptor
    throw error;
  }
};

const settingsService = { get, update };
export default settingsService;
