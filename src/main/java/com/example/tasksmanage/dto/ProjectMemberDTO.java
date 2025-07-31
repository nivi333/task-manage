package com.example.tasksmanage.dto;

import com.example.tasksmanage.model.ProjectMemberRole;
import java.util.Date;
import java.util.UUID;

public class ProjectMemberDTO {
    private UUID id;
    private UUID userId;
    private UUID projectId;
    private ProjectMemberRole role;
    private Date joinedAt;
    private Date lastActivityAt;
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public ProjectMemberRole getRole() { return role; }
    public void setRole(ProjectMemberRole role) { this.role = role; }
    public Date getJoinedAt() { return joinedAt; }
    public void setJoinedAt(Date joinedAt) { this.joinedAt = joinedAt; }
    public Date getLastActivityAt() { return lastActivityAt; }
    public void setLastActivityAt(Date lastActivityAt) { this.lastActivityAt = lastActivityAt; }
}
