package com.example.tasksmanage.dto;

import java.util.List;

public class UserSettingsDTO {
    public static class ProfileSettings {
        public String fullName;
        public String displayName;
        public String timezone;
    }

    public static class NotificationPreferences {
        public boolean emailEnabled;
        public boolean webEnabled;
        public boolean batchEnabled;
        public String batchFrequency; // optional
        public List<String> enabledTypes;
    }

    public String theme; // light | dark
    public String language; // en | es | fr | de | hi
    public ProfileSettings profile;
    public NotificationPreferences notifications;
}
