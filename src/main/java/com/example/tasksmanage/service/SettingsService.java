package com.example.tasksmanage.service;

import com.example.tasksmanage.dto.UserSettingsDTO;
import com.example.tasksmanage.model.User;

public interface SettingsService {
    UserSettingsDTO getSettings(User user);
    UserSettingsDTO updateSettings(User user, UserSettingsDTO req);
}
