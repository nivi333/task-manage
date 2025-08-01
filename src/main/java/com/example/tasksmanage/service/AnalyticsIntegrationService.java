package com.example.tasksmanage.service;

public interface AnalyticsIntegrationService {
    void pushMetric(String system, String metricName, double value);
}
