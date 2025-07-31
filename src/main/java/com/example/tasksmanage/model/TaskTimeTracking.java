package com.example.tasksmanage.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "task_time_tracking")
public class TaskTimeTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "task_id")
    private Task task;

    @Column(nullable = false)
    private Date startTime;

    @Column(nullable = false)
    private Date endTime;

    @Column(nullable = false)
    private Integer durationMinutes;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Getters and setters omitted for brevity
}
