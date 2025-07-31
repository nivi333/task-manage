package com.example.tasksmanage.controller;

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
}
