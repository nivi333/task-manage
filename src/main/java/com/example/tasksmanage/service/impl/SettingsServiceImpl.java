package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.dto.UserSettingsDTO;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.model.UserSettings;
import com.example.tasksmanage.repository.UserSettingsRepository;
import com.example.tasksmanage.service.SettingsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SettingsServiceImpl implements SettingsService {

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UserSettingsDTO defaultsFor(User user) {
        UserSettingsDTO dto = new UserSettingsDTO();
        dto.theme = "system";
        dto.language = "en";
        UserSettingsDTO.ProfileSettings profile = new UserSettingsDTO.ProfileSettings();
        profile.fullName = (user.getFirstName() + " " + user.getLastName()).trim();
        profile.displayName = user.getUsername();
        try {
            profile.timezone = java.util.TimeZone.getDefault().getID();
        } catch (Exception e) {
            profile.timezone = "UTC";
        }
        dto.profile = profile;
        UserSettingsDTO.NotificationPreferences np = new UserSettingsDTO.NotificationPreferences();
        np.emailEnabled = true;
        np.webEnabled = true;
        np.batchEnabled = false;
        np.batchFrequency = null;
        np.enabledTypes = List.of("TASK_ASSIGNED","TASK_UPDATED","COMMENT_ADDED","MENTION","PROJECT_UPDATED");
        dto.notifications = np;
        return dto;
    }

    @Override
    public UserSettingsDTO getSettings(User user) {
        Optional<UserSettings> existing = userSettingsRepository.findByUserId(user.getId());
        if (existing.isEmpty()) {
            return defaultsFor(user);
        }
        try {
            return objectMapper.readValue(existing.get().getSettingsJson(), UserSettingsDTO.class);
        } catch (Exception e) {
            // If corrupted, fall back to defaults
            return defaultsFor(user);
        }
    }

    @Override
    public UserSettingsDTO updateSettings(User user, UserSettingsDTO req) {
        try {
            String json = objectMapper.writeValueAsString(req);
            UserSettings entity = userSettingsRepository.findByUserId(user.getId()).orElseGet(UserSettings::new);
            entity.setUserId(user.getId());
            entity.setSettingsJson(json);
            userSettingsRepository.save(entity);
            return req;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save settings", e);
        }
    }
}
