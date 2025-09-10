export type ThemeOption = "light" | "dark";
export type ThemeColorScheme = "purple" | "blue" | "green" | "orange" | "pink";
export type LanguageOption = "en" | "es" | "fr" | "de" | "hi";

import type {
  BatchFrequency,
  NotificationTypeKey,
} from "./notificationPreferences";

export interface NotificationPreferences {
  emailEnabled: boolean;
  webEnabled: boolean;
  batchEnabled: boolean;
  batchFrequency?: BatchFrequency;
  enabledTypes: NotificationTypeKey[]; // e.g., TASK_ASSIGNED, COMMENT_ADDED
}

export interface ProfileSettings {
  fullName: string;
  displayName?: string;
  timezone?: string;
}

export interface UserSettings {
  theme: ThemeOption;
  colorScheme: ThemeColorScheme;
  language: LanguageOption;
  profile: ProfileSettings;
  notifications: NotificationPreferences;
}
