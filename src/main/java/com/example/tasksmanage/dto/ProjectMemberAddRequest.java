package com.example.tasksmanage.dto;

import com.example.tasksmanage.model.ProjectMemberRole;
import java.util.Set;
import java.util.UUID;

public class ProjectMemberAddRequest {
    private Set<UUID> userIds;
    private ProjectMemberRole role;
    public Set<UUID> getUserIds() { return userIds; }
    public void setUserIds(Set<UUID> userIds) { this.userIds = userIds; }
    public ProjectMemberRole getRole() { return role; }
    public void setRole(ProjectMemberRole role) { this.role = role; }
}
