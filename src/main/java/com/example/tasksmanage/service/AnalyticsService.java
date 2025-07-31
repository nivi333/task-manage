package com.example.tasksmanage.service;

import java.util.List;
import java.util.Map;

import java.util.Map;

import java.util.UUID;

public interface AnalyticsService {
    Map<String, Object> getUserProductivity(String userId);
    Map<String, Object> getUserWorkload(String userId);
    Map<String, Object> getUserTimeTracking(String userId);
    Map<String, Object> getUserActivityComparison(String[] userIds);

    Map<String, Object> getProjectSummary(UUID projectId);
    Map<String, Object> getProjectForecast(UUID projectId);
    Map<String, Object> getProjectTeamPerformance(UUID projectId);
    String exportProjectTeamPerformance(UUID projectId, String format);

    // --- System Reports ---
    List<Map<String, Object>> getSystemOverdueTasks();
    List<Map<String, Object>> getSystemTeamWorkload();
    Map<String, Object> getSystemUsage();
    Map<String, Object> getSystemPerformance();
    String exportTasks(String format);
    String exportActivityLogs(String format);
    String scheduleReport(Map<String, Object> scheduleRequest);
    String shareReport(Map<String, Object> shareRequest);
}

