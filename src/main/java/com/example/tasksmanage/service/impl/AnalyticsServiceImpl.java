package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.Task;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.model.ActivityLog;
import com.example.tasksmanage.repository.TaskRepository;
import com.example.tasksmanage.repository.UserRepository;
import com.example.tasksmanage.repository.ActivityLogRepository;
import com.example.tasksmanage.repository.ProjectRepository;
import com.example.tasksmanage.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Override
    public Map<String, Object> getUserProductivity(String userId) {
        Map<String, Object> result = new HashMap<>();
        List<Task> allTasks = userId == null ? taskRepository.findAll() : taskRepository.findByAssigneeId(UUID.fromString(userId));
        long completed = allTasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long created = allTasks.size();
        long comments = userId == null ? activityLogRepository.count() : activityLogRepository.countByUserIdAndAction(UUID.fromString(userId), "COMMENT");
        result.put("tasksCompleted", completed);
        result.put("tasksCreated", created);
        result.put("commentsAdded", comments);
        // Add more metrics as needed
        return result;
    }

    @Override
    public Map<String, Object> getUserWorkload(String userId) {
        Map<String, Object> result = new HashMap<>();
        List<Task> tasks = userId == null ? taskRepository.findAll() : taskRepository.findByAssigneeId(UUID.fromString(userId));
        long open = tasks.stream().filter(t -> "OPEN".equalsIgnoreCase(t.getStatus())).count();
        long inProgress = tasks.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();
        long overdue = tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().before(new Date()) && !"COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        result.put("openTasks", open);
        result.put("inProgressTasks", inProgress);
        result.put("overdueTasks", overdue);
        result.put("totalAssigned", tasks.size());
        return result;
    }

    @Override
    public Map<String, Object> getUserTimeTracking(String userId) {
        Map<String, Object> result = new HashMap<>();
        List<Task> tasks = userId == null ? taskRepository.findAll() : taskRepository.findByAssigneeId(UUID.fromString(userId));
        double avgCompletionTime = tasks.stream()
            .filter(t -> t.getCompletedAt() != null && t.getCreatedAt() != null)
            .mapToLong(t -> t.getCompletedAt().getTime() - t.getCreatedAt().getTime())
            .average().orElse(0);
        result.put("averageCompletionTimeMs", avgCompletionTime);
        // Add more time tracking as needed
        return result;
    }

    @Override
    public Map<String, Object> getUserActivityComparison(String[] userIds) {
        Map<String, Object> result = new HashMap<>();
        if (userIds == null || userIds.length == 0) return result;
        for (String id : userIds) {
            Map<String, Object> metrics = getUserProductivity(id);
            metrics.putAll(getUserWorkload(id));
            metrics.putAll(getUserTimeTracking(id));
            result.put(id, metrics);
        }
        return result;
    }

    @Override
    public Map<String, Object> getProjectSummary(UUID projectId) {
        Map<String, Object> summary = new HashMap<>();
        var projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) return summary;
        var project = projectOpt.get();
        summary.put("projectId", project.getId());
        summary.put("name", project.getName());
        summary.put("description", project.getDescription());
        summary.put("status", project.getStatus());
        summary.put("startDate", project.getStartDate());
        summary.put("endDate", project.getEndDate());
        summary.put("owner", project.getOwner() != null ? project.getOwner().getUsername() : null);
        var tasks = taskRepository.findByProjectId(projectId);
        long total = tasks.size();
        long completed = tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        summary.put("tasksTotal", total);
        summary.put("tasksCompleted", completed);
        summary.put("tasksInProgress", tasks.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count());
        summary.put("tasksOverdue", tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().before(new Date()) && !"COMPLETED".equalsIgnoreCase(t.getStatus())).count());
        summary.put("percentComplete", total > 0 ? (completed * 100.0 / total) : 0);
        // Add milestones/timeline as needed
        return summary;
    }

    @Override
    public Map<String, Object> getProjectForecast(UUID projectId) {
        Map<String, Object> forecast = new HashMap<>();
        var projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) return forecast;
        var project = projectOpt.get();
        var tasks = taskRepository.findByProjectId(projectId);
        long total = tasks.size();
        long completed = tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long overdue = tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().before(new Date()) && !"COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        forecast.put("budgetPlanned", project.getBudgetPlanned());
        forecast.put("budgetActual", project.getBudgetActual());
        forecast.put("budgetVariance", project.getBudgetActual() != null && project.getBudgetPlanned() != null ? project.getBudgetActual() - project.getBudgetPlanned() : null);
        forecast.put("riskLevel", overdue > 0 ? (overdue > total * 0.2 ? "HIGH" : "MEDIUM") : "LOW");
        forecast.put("completionEstimate", total > 0 ? (completed * 100.0 / total) : 0);
        forecast.put("estimatedEndDate", project.getEndDate());
        // Add more forecast logic as needed
        return forecast;
    }

    @Override
    public Map<String, Object> getProjectTeamPerformance(UUID projectId) {
        Map<String, Object> perf = new HashMap<>();
        var projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) return perf;
        var project = projectOpt.get();
        var members = project.getTeamMembers();
        var tasks = taskRepository.findByProjectId(projectId);
        for (var member : members) {
            var memberTasks = tasks.stream().filter(t -> t.getAssignedTo() != null && t.getAssignedTo().getId().equals(member.getId())).toList();
            Map<String, Object> metrics = new HashMap<>();
            metrics.put("tasksAssigned", memberTasks.size());
            metrics.put("tasksCompleted", memberTasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count());
            metrics.put("tasksOverdue", memberTasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().before(new Date()) && !"COMPLETED".equalsIgnoreCase(t.getStatus())).count());
            metrics.put("tasksInProgress", memberTasks.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count());
            perf.put(member.getUsername(), metrics);
        }
        return perf;
    }

    @Override
    public String exportProjectTeamPerformance(UUID projectId, String format) {
        Map<String, Object> perf = getProjectTeamPerformance(projectId);
        if ("json".equalsIgnoreCase(format)) {
            return new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(perf).toString();
        } else {
            // CSV export
            StringBuilder sb = new StringBuilder();
            sb.append("username,tasksAssigned,tasksCompleted,tasksOverdue,tasksInProgress\n");
            for (var entry : perf.entrySet()) {
                Map<String, Object> m = (Map<String, Object>) entry.getValue();
                sb.append(entry.getKey()).append(",")
                  .append(m.getOrDefault("tasksAssigned", 0)).append(",")
                  .append(m.getOrDefault("tasksCompleted", 0)).append(",")
                  .append(m.getOrDefault("tasksOverdue", 0)).append(",")
                  .append(m.getOrDefault("tasksInProgress", 0)).append("\n");
            }
            return sb.toString();
        }
    }
}

