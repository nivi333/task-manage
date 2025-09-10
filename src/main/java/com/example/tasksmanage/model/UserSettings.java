package com.example.tasksmanage.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "user_settings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id"})
})
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Lob
    @Column(name = "settings_json", nullable = false)
    private String settingsJson;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getSettingsJson() { return settingsJson; }
    public void setSettingsJson(String settingsJson) { this.settingsJson = settingsJson; }
}
