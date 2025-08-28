package com.example.tasksmanage.service;

import com.example.tasksmanage.model.Project;
import com.example.tasksmanage.model.Task;
import com.example.tasksmanage.repository.ProjectRepository;
import com.example.tasksmanage.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
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
        long doneTasks = tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        long inProgressTasks = tasks.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count();
        long overdueTasks = tasks.stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().before(new Date()) && (t.getStatus() == null || !"COMPLETED".equals(t.getStatus())))
                .count();
        long openTasks = Math.max(0, totalTasks - (int) (doneTasks + inProgressTasks));

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalTasks", totalTasks);
        metrics.put("openTasks", openTasks);
        metrics.put("inProgressTasks", inProgressTasks);
        metrics.put("doneTasks", doneTasks);
        metrics.put("overdueTasks", overdueTasks);
        metrics.put("completionPercent", totalTasks > 0 ? (double) doneTasks / totalTasks * 100 : 0.0);

        // Build a lightweight, serialization-safe project DTO (no JPA entities)
        Map<String, Object> projectDto = new LinkedHashMap<>();
        projectDto.put("id", project.getId());
        projectDto.put("key", project.getKey());
        projectDto.put("name", project.getName());
        projectDto.put("description", project.getDescription());
        projectDto.put("status", project.getStatus() != null ? project.getStatus().name() : null);
        projectDto.put("startDate", project.getStartDate());
        projectDto.put("endDate", project.getEndDate());
        // Owner summary
        if (project.getOwner() != null) {
            Map<String, Object> owner = new LinkedHashMap<>();
            owner.put("id", project.getOwner().getId());
            String ownerName = buildUserDisplayName(project.getOwner());
            owner.put("name", ownerName);
            owner.put("email", project.getOwner().getEmail());
            projectDto.put("owner", owner);
        }
        // Team member summaries (id + name only)
        List<Map<String, Object>> team = Optional.ofNullable(project.getTeamMembers())
                .orElse(Collections.emptySet())
                .stream()
                .map(u -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("name", buildUserDisplayName(u));
                    m.put("email", u.getEmail());
                    return m;
                })
                .collect(Collectors.toList());

        // Assemble dashboard payload expected by frontend
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("project", projectDto);
        payload.put("metrics", metrics);
        // Optional sections – provide safe defaults to avoid client errors
        payload.put("taskSummary", Collections.emptyList());
        payload.put("team", team);
        payload.put("timeline", getTimeline(projectId));
        payload.put("recentActivity", Collections.emptyList());
        return payload;
    }

    private String buildUserDisplayName(com.example.tasksmanage.model.User u) {
        String fn = u.getFirstName();
        String ln = u.getLastName();
        String full = ((fn != null ? fn.trim() : "") + " " + (ln != null ? ln.trim() : "")).trim();
        if (!full.isEmpty()) return full;
        return u.getUsername();
    }

    public List<Map<String, Object>> getBurndown(UUID projectId) {
        List<Task> tasks = Optional.ofNullable(taskRepository.findByProjectId(projectId)).orElse(Collections.emptyList());
        // Example: return daily remaining task counts (stub) matching UI schema
        Map<Date, Long> deltaByDay = new TreeMap<>();
        for (Task t : tasks) {
            if (t.getCreatedAt() != null) {
                deltaByDay.merge(truncateDay(t.getCreatedAt()), 1L, Long::sum);
            }
            if (t.getStatus() != null && t.getStatus().equals("COMPLETED") && t.getUpdatedAt() != null) {
                deltaByDay.merge(truncateDay(t.getUpdatedAt()), -1L, Long::sum);
            }
        }
        List<Map<String, Object>> burndown = new ArrayList<>();
        long running = 0;
        for (Map.Entry<Date, Long> entry : deltaByDay.entrySet()) {
            running += entry.getValue();
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", entry.getKey());
            point.put("remaining", running);
            burndown.add(point);
        }
        return burndown;
    }

    public List<Map<String, Object>> getTimeline(UUID projectId) {
        List<Task> tasks = Optional.ofNullable(taskRepository.findByProjectId(projectId)).orElse(Collections.emptyList());
        // Return a lightweight timeline with simple scalar fields
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
