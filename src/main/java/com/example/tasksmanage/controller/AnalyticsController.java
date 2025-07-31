package com.example.tasksmanage.controller;

import java.util.List;
import java.util.Map;

import java.util.UUID;

import com.example.tasksmanage.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
public class AnalyticsController {
    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/productivity")
    public Map<String, Object> getProductivity(@RequestParam(required = false) String userId) {
        return analyticsService.getUserProductivity(userId);
    }

    @GetMapping("/workload")
    public Map<String, Object> getWorkload(@RequestParam(required = false) String userId) {
        return analyticsService.getUserWorkload(userId);
    }


    @GetMapping("/time-tracking")
    public Map<String, Object> getTimeTracking(@RequestParam(required = false) String userId) {
        return analyticsService.getUserTimeTracking(userId);
    }

    @GetMapping("/activity-comparison")
    public Map<String, Object> getActivityComparison(@RequestParam(required = false) String[] userIds) {
        return analyticsService.getUserActivityComparison(userIds);
    }

    @GetMapping("/project/{id}/summary")
    public Map<String, Object> getProjectSummary(@PathVariable("id") String projectId) {
        return analyticsService.getProjectSummary(UUID.fromString(projectId));
    }

    @GetMapping("/project/{id}/forecast")
    public Map<String, Object> getProjectForecast(@PathVariable("id") String projectId) {
        return analyticsService.getProjectForecast(UUID.fromString(projectId));
    }

    @GetMapping("/project/{id}/team-performance")
    public Map<String, Object> getTeamPerformance(@PathVariable("id") String projectId) {
        return analyticsService.getProjectTeamPerformance(UUID.fromString(projectId));
    }

    @GetMapping("/project/{id}/team-performance/export")
    public String exportTeamPerformance(@PathVariable("id") String projectId, @RequestParam(defaultValue = "csv") String format) {
        return analyticsService.exportProjectTeamPerformance(UUID.fromString(projectId), format);
    }

    // --- System Reports ---
    @GetMapping("/system/overdue-tasks")
    public List<Map<String, Object>> getSystemOverdueTasks() {
        return analyticsService.getSystemOverdueTasks();
    }

    @GetMapping("/system/team-workload")
    public List<Map<String, Object>> getSystemTeamWorkload() {
        return analyticsService.getSystemTeamWorkload();
    }

    @GetMapping("/system/usage")
    public Map<String, Object> getSystemUsage() {
        return analyticsService.getSystemUsage();
    }

    @GetMapping("/system/performance")
    public Map<String, Object> getSystemPerformance() {
        return analyticsService.getSystemPerformance();
    }

    @GetMapping("/export/tasks")
    public String exportTasks(@RequestParam(defaultValue = "csv") String format) {
        return analyticsService.exportTasks(format);
    }

    @GetMapping("/export/activity-logs")
    public String exportActivityLogs(@RequestParam(defaultValue = "csv") String format) {
        return analyticsService.exportActivityLogs(format);
    }

    @PostMapping("/reports/schedule")
    public String scheduleReport(@RequestBody Map<String, Object> scheduleRequest) {
        return analyticsService.scheduleReport(scheduleRequest);
    }

    @PostMapping("/reports/share")
    public String shareReport(@RequestBody Map<String, Object> shareRequest) {
        return analyticsService.shareReport(shareRequest);
    }
}

