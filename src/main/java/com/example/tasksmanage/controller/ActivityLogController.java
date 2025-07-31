package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.ActivityLog;
import com.example.tasksmanage.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/activities")
public class ActivityLogController {
    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public Page<ActivityLog> getActivityFeed(@RequestParam Map<String, String> filters,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return activityLogService.getActivityFeed(filters, PageRequest.of(page, size));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportActivities(@RequestParam Map<String, String> filters,
                                                  @RequestParam(defaultValue = "csv") String format) {
        byte[] data = activityLogService.exportActivities(filters, format);
        String filename = "activities." + format;
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
            .contentType("csv".equalsIgnoreCase(format) ? MediaType.TEXT_PLAIN : MediaType.APPLICATION_JSON)
            .body(data);
    }
}
