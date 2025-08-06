package com.example.tasksmanage.controller;

import com.example.tasksmanage.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/integrations/analytics")
public class AnalyticsController {
    @Autowired
    private AnalyticsService analyticsService;

    @PostMapping("/push-metric")
    public ResponseEntity<String> pushMetric(@RequestParam String system, @RequestParam String metricName, @RequestParam double value) {
        analyticsService.pushMetric(system, metricName, value);
        return ResponseEntity.ok("Metric pushed to " + system);
    }
}
