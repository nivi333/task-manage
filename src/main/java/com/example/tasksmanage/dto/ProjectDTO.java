package com.example.tasksmanage.dto;

import com.example.tasksmanage.model.ProjectStatus;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

public class ProjectDTO {
    private UUID id;
    private String name;
    private String description;
    private ProjectStatus status;
    private Date startDate;
    private Date endDate;
    private UUID ownerId;
    private Set<UUID> teamMemberIds;
    private Date createdAt;
    private Date updatedAt;
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }
    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }
    public UUID getOwnerId() { return ownerId; }
    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }
    public Set<UUID> getTeamMemberIds() { return teamMemberIds; }
    public void setTeamMemberIds(Set<UUID> teamMemberIds) { this.teamMemberIds = teamMemberIds; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
