package com.example.tasksmanage.dto;

public class ProjectInvitationRequest {
    private String email;
    private long expiresInHours;
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public long getExpiresInHours() { return expiresInHours; }
    public void setExpiresInHours(long expiresInHours) { this.expiresInHours = expiresInHours; }
}
