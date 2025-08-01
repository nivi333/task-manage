package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.AnalyticsIntegrationService;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsIntegrationServiceImpl implements AnalyticsIntegrationService {
    @Override
    public void pushMetric(String system, String metricName, double value) {
        // TODO: Integrate with analytics/monitoring system (Prometheus, Grafana)
        System.out.println("[Stub] Pushing metric '" + metricName + "' with value " + value + " to " + system);
    }
}
