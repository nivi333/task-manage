package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.NotificationPreferences;
import com.example.tasksmanage.repository.NotificationPreferencesRepository;
import com.example.tasksmanage.repository.UserRepository;
import com.example.tasksmanage.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notification-preferences")
public class NotificationPreferencesController {
    @Autowired
    private NotificationPreferencesRepository preferencesRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<NotificationPreferences> getPreferences(@RequestParam UUID userId) {
        return ResponseEntity.ok(preferencesRepository.findByUser_Id(userId));
    }

    @PutMapping
    public ResponseEntity<NotificationPreferences> updatePreferences(@RequestParam UUID userId, @RequestBody NotificationPreferences prefs) {
        NotificationPreferences existing = preferencesRepository.findByUser_Id(userId);
        if (existing != null) {
            existing.setEmailEnabled(prefs.isEmailEnabled());
            existing.setWebEnabled(prefs.isWebEnabled());
            existing.setBatchEnabled(prefs.isBatchEnabled());
            return ResponseEntity.ok(preferencesRepository.save(existing));
        } else {
            User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
            prefs.setUser(user);
            return ResponseEntity.ok(preferencesRepository.save(prefs));
        }
    }
}
