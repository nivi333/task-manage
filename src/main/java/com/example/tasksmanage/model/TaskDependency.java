package com.example.tasksmanage.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "task_dependencies")
public class TaskDependency {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(optional = false)
    @JoinColumn(name = "depends_on_task_id")
    private Task dependsOn;

    // Getters and setters omitted for brevity
}
