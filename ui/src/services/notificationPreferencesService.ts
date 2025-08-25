import apiClient from './authService';
import { notificationService } from './notificationService';
import { NotificationPreferences } from '../types/notificationPreferences';

const API_URL = '/notification-preferences';

const get = async (userId: string): Promise<NotificationPreferences | null> => {
  try {
    const response = await apiClient.get<NotificationPreferences>(`${API_URL}`, { params: { userId } });
    return response.data ?? null;
  } catch (error) {
    notificationService.error('Failed to load notification preferences.');
    throw error;
  }
};

const update = async (prefs: NotificationPreferences): Promise<NotificationPreferences> => {
  try {
    const response = await apiClient.put<NotificationPreferences>(`${API_URL}`, prefs, { params: { userId: prefs.userId } });
    notificationService.success('Notification preferences saved.');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const notificationPreferencesService = { get, update };
export default notificationPreferencesService;
