package com.example.tasksmanage.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "projects",
    indexes = {
        @Index(name = "idx_project_name", columnList = "name"),
        @Index(name = "idx_project_status", columnList = "status"),
        @Index(name = "idx_project_owner", columnList = "owner_id"),
        @Index(name = "idx_project_start_date", columnList = "startDate")
    }
)
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "project_key")
    private String key;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    private Date startDate;
    private Date endDate;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToMany
    @JoinTable(name = "project_team_members",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> teamMembers = new HashSet<>();

    @OneToMany(mappedBy = "project")
    private Set<Task> tasks = new HashSet<>();

    private Double budgetPlanned;
    private Double budgetActual;

    @Column(nullable = false, updatable = false)
    private Date createdAt;
    @Column(nullable = false)
    private Date updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }
    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public Set<User> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(Set<User> teamMembers) { this.teamMembers = teamMembers; }
    public Set<Task> getTasks() { return tasks; }
    public void setTasks(Set<Task> tasks) { this.tasks = tasks; }

    public Double getBudgetPlanned() { return budgetPlanned; }
    public void setBudgetPlanned(Double budgetPlanned) { this.budgetPlanned = budgetPlanned; }
    public Double getBudgetActual() { return budgetActual; }
    public void setBudgetActual(Double budgetActual) { this.budgetActual = budgetActual; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}

