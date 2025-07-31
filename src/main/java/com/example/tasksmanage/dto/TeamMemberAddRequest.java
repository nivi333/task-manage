package com.example.tasksmanage.dto;

import java.util.UUID;

public class TeamMemberAddRequest {
    private UUID userId;
    private String role; // Role within the team

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
