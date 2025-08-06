package com.example.tasksmanage.service;

public interface AnalyticsService {
    void pushMetric(String system, String metricName, double value);
}
