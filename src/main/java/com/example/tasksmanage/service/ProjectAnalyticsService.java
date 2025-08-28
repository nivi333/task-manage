package com.example.tasksmanage.service;

import com.example.tasksmanage.model.Project;
import com.example.tasksmanage.model.Task;
import com.example.tasksmanage.repository.ProjectRepository;
import com.example.tasksmanage.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.UUID;

@Service
public class ProjectAnalyticsService {
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private TaskRepository taskRepository;

    public Map<String, Object> getDashboard(UUID projectId) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            throw new NoSuchElementException("Project not found");
        }
        Project project = projectOpt.get();

        List<Task> tasks = Optional.ofNullable(taskRepository.findByProjectId(projectId)).orElse(Collections.emptyList());
        long totalTasks = tasks.size();
        long completed = tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        long inProgress = tasks.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count();
        long overdue = tasks.stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().before(new Date()) && (t.getStatus() == null || !"COMPLETED".equals(t.getStatus())))
                .count();

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalTasks", totalTasks);
        metrics.put("completedTasks", completed);
        metrics.put("inProgressTasks", inProgress);
        metrics.put("overdueTasks", overdue);
        metrics.put("percentComplete", totalTasks > 0 ? (double) completed / totalTasks * 100 : 0.0);

        // Assemble dashboard payload expected by frontend
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("project", project);
        payload.put("metrics", metrics);
        // Optional sections – provide safe defaults to avoid client errors
        payload.put("taskSummary", Collections.emptyList());
        payload.put("team", Collections.emptyList());
        payload.put("timeline", getTimeline(projectId));
        payload.put("recentActivity", Collections.emptyList());
        return payload;
    }

    public List<Map<String, Object>> getBurndown(UUID projectId) {
        List<Task> tasks = Optional.ofNullable(taskRepository.findByProjectId(projectId)).orElse(Collections.emptyList());
        // Example: return daily open task counts (stub)
        Map<Date, Long> openTasksByDay = new TreeMap<>();
        for (Task t : tasks) {
            if (t.getCreatedAt() != null) {
                openTasksByDay.merge(truncateDay(t.getCreatedAt()), 1L, Long::sum);
            }
            // Use updatedAt as completedAt if status is COMPLETED
            if (t.getStatus() != null && t.getStatus().equals("COMPLETED") && t.getUpdatedAt() != null) {
                openTasksByDay.merge(truncateDay(t.getUpdatedAt()), -1L, Long::sum);
            }
        }
        List<Map<String, Object>> burndown = new ArrayList<>();
        long running = 0;
        for (Map.Entry<Date, Long> entry : openTasksByDay.entrySet()) {
            running += entry.getValue();
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", entry.getKey());
            point.put("openTasks", running);
            burndown.add(point);
        }
        return burndown;
    }

    public List<Map<String, Object>> getTimeline(UUID projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        // Example: return task start/end for Gantt
        return tasks.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("taskId", t.getId());
            map.put("title", t.getTitle());
            map.put("start", t.getCreatedAt());
            map.put("end", t.getDueDate());
            map.put("status", t.getStatus());
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Long> getWorkload(UUID projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream()
                .filter(t -> t.getAssignedTo() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getAssignedTo().getId().toString(), Collectors.counting()
                ));
    }

    public Map<String, Object> getCompletionAndBudget(UUID projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        double percentComplete = 0.0;
        long totalTasks = tasks.size();
        long completed = tasks.stream().filter(t -> t.getStatus() != null && t.getStatus().equals("COMPLETED")).count();
        if (totalTasks > 0) percentComplete = (double) completed / totalTasks * 100;
        // Budget tracking stub (assume project has budget fields)
        Map<String, Object> result = new HashMap<>();
        result.put("percentComplete", percentComplete);
        // result.put("budgetUsed", ...); // Add budget logic if available
        return result;
    }

    private Date truncateDay(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }
}
