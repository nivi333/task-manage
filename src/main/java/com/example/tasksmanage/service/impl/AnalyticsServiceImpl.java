package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.AnalyticsService;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {
    @Override
    public void pushMetric(String system, String metricName, double value) {
        // TODO: Integrate with analytics/monitoring system (Prometheus, Grafana)
        System.out.println("[Stub] Pushing metric '" + metricName + "' with value " + value + " to " + system);
    }
}
