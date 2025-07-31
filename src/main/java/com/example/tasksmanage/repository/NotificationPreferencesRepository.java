package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.NotificationPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface NotificationPreferencesRepository extends JpaRepository<NotificationPreferences, UUID> {
    NotificationPreferences findByUserId(UUID userId);
}
