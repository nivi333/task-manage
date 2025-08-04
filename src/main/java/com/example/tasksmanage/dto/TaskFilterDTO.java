package com.example.tasksmanage.dto;

import java.util.*;

public class TaskFilterDTO {
    private UUID teamId;
    public UUID getTeamId() { return teamId; }
    public void setTeamId(UUID teamId) { this.teamId = teamId; }

    private String status;
    private String priority;
    private UUID assignedTo;
    private UUID projectId;
    private Set<String> tags;
    private Date dueDateFrom;
    private Date dueDateTo;
    private Date createdAtFrom;
    private Date createdAtTo;
    private String search;
    private String sortBy;
    private String sortDir = "asc";
    private Integer page = 0;
    private Integer size = 10;

    // Getters and setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public UUID getAssignedTo() { return assignedTo; }
    public void setAssignedTo(UUID assignedTo) { this.assignedTo = assignedTo; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }
    public Date getDueDateFrom() { return dueDateFrom; }
    public void setDueDateFrom(Date dueDateFrom) { this.dueDateFrom = dueDateFrom; }
    public Date getDueDateTo() { return dueDateTo; }
    public void setDueDateTo(Date dueDateTo) { this.dueDateTo = dueDateTo; }
    public Date getCreatedAtFrom() { return createdAtFrom; }
    public void setCreatedAtFrom(Date createdAtFrom) { this.createdAtFrom = createdAtFrom; }
    public Date getCreatedAtTo() { return createdAtTo; }
    public void setCreatedAtTo(Date createdAtTo) { this.createdAtTo = createdAtTo; }
    public String getSearch() { return search; }
    public void setSearch(String search) { this.search = search; }
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    public String getSortDir() { return sortDir; }
    public void setSortDir(String sortDir) { this.sortDir = sortDir; }
    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }
    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }
}
