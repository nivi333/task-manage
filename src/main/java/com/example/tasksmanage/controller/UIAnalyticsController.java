package com.example.tasksmanage.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Temporary UI-facing analytics endpoints to unblock the Analytics Dashboard.
 * These return safe empty data structures so the UI can render without errors.
 * Replace with real implementations when backend analytics are ready.
 */
@RestController
@RequestMapping("/api/v1/analytics")
public class UIAnalyticsController {

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestParam String from,
            @RequestParam String to
    ) {
        Map<String, Object> body = new HashMap<>();
        body.put("totalTasksCompleted", 0);
        body.put("avgCycleTimeDays", 0);
        body.put("activeProjects", 0);
        body.put("openTasks", 0);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/timeline")
    public ResponseEntity<List<Map<String, Object>>> getTimeline(
            @RequestParam String from,
            @RequestParam String to
    ) {
        // Each item shape: { date: ISO string, tasksCompleted: number, tasksCreated?: number }
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/team-productivity")
    public ResponseEntity<List<Map<String, Object>>> getTeamProductivity(
            @RequestParam String from,
            @RequestParam String to
    ) {
        // Each item shape: { teamId: string, teamName: string, tasksCompleted: number, avgCycleTimeDays: number }
        return ResponseEntity.ok(Collections.emptyList());
    }
}
