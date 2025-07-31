package com.example.tasksmanage.service.impl;

import java.lang.management.ManagementFactory;

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
        List<Task> allTasks = userId == null ? taskRepository.findAll() : taskRepository.findByAssignedTo_Id(UUID.fromString(userId));
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
        List<Task> tasks = userId == null ? taskRepository.findAll() : taskRepository.findByAssignedTo_Id(UUID.fromString(userId));
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
        List<Task> tasks = userId == null ? taskRepository.findAll() : taskRepository.findByAssignedTo_Id(UUID.fromString(userId));
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

    // --- System Reports ---
    @Override
    public List<Map<String, Object>> getSystemOverdueTasks() {
        List<Task> overdueTasks = taskRepository.findAll().stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().before(new Date()) && !"COMPLETED".equalsIgnoreCase(t.getStatus()))
                .toList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Task t : overdueTasks) {
            Map<String, Object> map = new HashMap<>();
            map.put("taskId", t.getId());
            map.put("title", t.getTitle());
            map.put("assignedTo", t.getAssignedTo() != null ? t.getAssignedTo().getUsername() : null);
            map.put("dueDate", t.getDueDate());
            map.put("status", t.getStatus());
            map.put("projectId", t.getProject() != null ? t.getProject().getId() : null);
            result.add(map);
        }
        return result;
    }

    @Override
    public List<Map<String, Object>> getSystemTeamWorkload() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (User user : users) {
            List<Task> tasks = taskRepository.findByAssignedTo_Id(user.getId());
            Map<String, Object> map = new HashMap<>();
            map.put("userId", user.getId());
            map.put("username", user.getUsername());
            map.put("openTasks", tasks.stream().filter(t -> "OPEN".equalsIgnoreCase(t.getStatus())).count());
            map.put("inProgressTasks", tasks.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count());
            map.put("overdueTasks", tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().before(new Date()) && !"COMPLETED".equalsIgnoreCase(t.getStatus())).count());
            map.put("totalAssigned", tasks.size());
            result.add(map);
        }
        return result;
    }

    @Override
    public Map<String, Object> getSystemUsage() {
        Map<String, Object> usage = new HashMap<>();
        usage.put("activeUsers", userRepository.count());
        usage.put("tasksCreated", taskRepository.count());
        usage.put("tasksCompleted", taskRepository.findAll().stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count());
        usage.put("commentsAdded", activityLogRepository.countByAction("COMMENT"));
        usage.put("activityLogs", activityLogRepository.count());
        // Add more usage metrics as needed
        return usage;
    }

    @Override
    public Map<String, Object> getSystemPerformance() {
        // Stub: In a real system, gather JVM/memory/DB stats, etc.
        Map<String, Object> perf = new HashMap<>();
        perf.put("uptime", ManagementFactory.getRuntimeMXBean().getUptime());
        perf.put("heapUsedMB", ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed() / (1024 * 1024));
        perf.put("heapMaxMB", ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getMax() / (1024 * 1024));
        perf.put("availableProcessors", ManagementFactory.getOperatingSystemMXBean().getAvailableProcessors());
        // Add DB and other metrics as needed
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.findAll().stream()
                .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .count();
        double avgCompletionTime = 0.0; // stub value, implement actual calculation if created/completed timestamps available
        perf.put("tasksTotal", totalTasks);
        perf.put("tasksCompleted", completedTasks);
        perf.put("averageCompletionTimeMs", avgCompletionTime);
        // Add more performance metrics as needed
        return perf;
    }

    @Override
    public String exportTasks(String format) {
        List<Task> tasks = taskRepository.findAll();
        if ("json".equalsIgnoreCase(format)) {
            try {
                return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(tasks);
            } catch (Exception e) {
                return "{}";
            }
        } else {
            StringBuilder sb = new StringBuilder();
            sb.append("taskId,title,status,assignedTo,projectId,dueDate\n");
            for (Task t : tasks) {
                sb.append(t.getId()).append(",")
                  .append(t.getTitle()).append(",")
                  .append(t.getStatus()).append(",")
                  .append(t.getAssignedTo() != null ? t.getAssignedTo().getUsername() : "").append(",")
                  .append(t.getProject() != null ? t.getProject().getId() : "").append(",")
                  .append(t.getDueDate()).append("\n");
            }
            return sb.toString();
        }
    }

    @Override
    public String exportActivityLogs(String format) {
        List<ActivityLog> logs = activityLogRepository.findAll();
        if ("json".equalsIgnoreCase(format)) {
            try {
                return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(logs);
            } catch (Exception e) {
                return "{}";
            }
        } else {
            StringBuilder sb = new StringBuilder();
            sb.append("id,action,details,user,timestamp,entityType,entityId\n");
            for (ActivityLog log : logs) {
                sb.append(log.getId()).append(",")
                  .append(log.getAction()).append(",")
                  .append(log.getDetails() != null ? log.getDetails().replaceAll(",", " ") : "").append(",")
                  .append(log.getUser() != null ? log.getUser().getUsername() : "").append(",")
                  .append(log.getTimestamp()).append(",")
                  .append(log.getEntityType()).append(",")
                  .append(log.getEntityId()).append("\n");
            }
            return sb.toString();
        }
    }

    @Override
    public String scheduleReport(Map<String, Object> scheduleRequest) {
        // Stub: In a real system, this would schedule a report for email delivery
        return "Report scheduling is not implemented yet.";
    }

    @Override
    public String shareReport(Map<String, Object> shareRequest) {
        // Stub: In a real system, this would share a report with users
        return "Report sharing is not implemented yet.";
    }
}


