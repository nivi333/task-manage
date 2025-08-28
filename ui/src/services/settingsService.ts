import apiClient from './authService';
import { notificationService } from './notificationService';
import type { UserSettings } from '../types/settings';

const API_URL = '/settings';
const LOCAL_KEY = 'tt_user_settings';

const DEFAULTS: UserSettings = {
  theme: 'system',
  language: 'en',
  profile: { fullName: '', displayName: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  notifications: { emailEnabled: true, webEnabled: true, batchEnabled: false, enabledTypes: ['TASK_ASSIGNED','TASK_UPDATED','COMMENT_ADDED','MENTION','PROJECT_UPDATED'] },
};

const readLocal = (): UserSettings | null => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as UserSettings) : null;
  } catch {
    return null;
  }
};

const writeLocal = (data: UserSettings) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
};

const get = async (): Promise<UserSettings> => {
  try {
    const res = await apiClient.get<UserSettings>(API_URL);
    const data = res.data as UserSettings;
    writeLocal(data);
    return data;
  } catch (error: any) {
    // Fallback if endpoint is not implemented or errors out (404/500/etc)
    const local = readLocal();
    return local ?? DEFAULTS;
  }
};

const update = async (settings: UserSettings): Promise<UserSettings> => {
  try {
    const res = await apiClient.put<UserSettings>(API_URL, settings);
    notificationService.success('Settings saved successfully.');
    const saved = res.data as UserSettings;
    writeLocal(saved);
    return saved;
  } catch (error) {
    // If API not available, persist locally so UI continues to work
    writeLocal(settings);
    notificationService.success('Settings saved locally.');
    return settings;
  }
};

const settingsService = { get, update };
export default settingsService;
