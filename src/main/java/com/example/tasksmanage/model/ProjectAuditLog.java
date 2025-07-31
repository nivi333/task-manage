package com.example.tasksmanage.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "project_audit_logs")
public class ProjectAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false)
    private UUID performedBy; // user id who performed action

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectAuditAction action;

    @Column(length = 1000)
    private String details;

    @Column(nullable = false, updatable = false)
    private Date timestamp = new Date();

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public UUID getPerformedBy() { return performedBy; }
    public void setPerformedBy(UUID performedBy) { this.performedBy = performedBy; }
    public ProjectAuditAction getAction() { return action; }
    public void setAction(ProjectAuditAction action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
}
