package com.example.tasksmanage.dto;

import java.util.UUID;

public class TaskAssignmentDTO {
    private UUID assignedTo;
    private UUID delegatedBy;
    private Boolean notifyUser = true;

    public UUID getAssignedTo() { return assignedTo; }
    public void setAssignedTo(UUID assignedTo) { this.assignedTo = assignedTo; }
    public UUID getDelegatedBy() { return delegatedBy; }
    public void setDelegatedBy(UUID delegatedBy) { this.delegatedBy = delegatedBy; }
    public Boolean getNotifyUser() { return notifyUser; }
    public void setNotifyUser(Boolean notifyUser) { this.notifyUser = notifyUser; }
}
