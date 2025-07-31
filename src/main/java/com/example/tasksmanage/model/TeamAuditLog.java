package com.example.tasksmanage.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "team_audit_logs")
public class TeamAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(nullable = false)
    private UUID performedBy; // user id who performed action

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamAuditAction action;

    @Column(length = 1000)
    private String details;

    @Column(nullable = false, updatable = false)
    private Date timestamp = new Date();

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    public UUID getPerformedBy() { return performedBy; }
    public void setPerformedBy(UUID performedBy) { this.performedBy = performedBy; }
    public TeamAuditAction getAction() { return action; }
    public void setAction(TeamAuditAction action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
}
