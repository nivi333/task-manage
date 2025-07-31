package com.example.tasksmanage.dto;

import jakarta.validation.constraints.NotNull;

public class TaskStatusUpdateDTO {
    @NotNull
    private String status;
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
