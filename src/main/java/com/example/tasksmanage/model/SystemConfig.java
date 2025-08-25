package com.example.tasksmanage.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
public class SystemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String keyName; // e.g., "global"

    @Lob
    @Column(nullable = false)
    private String jsonValue; // stored as JSON string

    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getKeyName() { return keyName; }
    public void setKeyName(String keyName) { this.keyName = keyName; }
    public String getJsonValue() { return jsonValue; }
    public void setJsonValue(String jsonValue) { this.jsonValue = jsonValue; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }
}
