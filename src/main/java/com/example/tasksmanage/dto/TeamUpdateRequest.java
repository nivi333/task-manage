package com.example.tasksmanage.dto;

import java.util.UUID;

public class TeamUpdateRequest {
    private String name;
    private String description;
    private UUID parentTeamId;

    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public UUID getParentTeamId() { return parentTeamId; }
    public void setParentTeamId(UUID parentTeamId) { this.parentTeamId = parentTeamId; }
}
