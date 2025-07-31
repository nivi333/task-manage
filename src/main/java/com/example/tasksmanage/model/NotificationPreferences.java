package com.example.tasksmanage.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private boolean emailEnabled = true;
    private boolean webEnabled = true;
    private boolean batchEnabled = false;

    // Add more preferences as needed (by type, etc.)
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public boolean isEmailEnabled() { return emailEnabled; }
    public void setEmailEnabled(boolean emailEnabled) { this.emailEnabled = emailEnabled; }
    public boolean isWebEnabled() { return webEnabled; }
    public void setWebEnabled(boolean webEnabled) { this.webEnabled = webEnabled; }
    public boolean isBatchEnabled() { return batchEnabled; }
    public void setBatchEnabled(boolean batchEnabled) { this.batchEnabled = batchEnabled; }
}
