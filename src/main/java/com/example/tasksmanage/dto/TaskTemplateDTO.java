package com.example.tasksmanage.dto;

import java.util.*;

public class TaskTemplateDTO {
    private UUID id;
    private String title;
    private String description;
    private Set<String> tags;
    private String status;
    private String priority;
    private Integer estimatedHours;
    private Integer actualHours;
    private Date dueDate;
    private Date createdAt;
    private Date updatedAt;
    // Getters and setters omitted for brevity
}
