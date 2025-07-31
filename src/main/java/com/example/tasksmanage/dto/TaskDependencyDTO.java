package com.example.tasksmanage.dto;

import java.util.UUID;

public class TaskDependencyDTO {
    private UUID id;
    private UUID taskId;
    private UUID dependsOnTaskId;
    // Getters and setters omitted for brevity
}
