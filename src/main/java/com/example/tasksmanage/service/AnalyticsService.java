package com.example.tasksmanage.service;

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
}
