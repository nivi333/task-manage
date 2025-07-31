package com.example.tasksmanage.service;

import com.example.tasksmanage.model.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Map;

public interface ActivityLogService {
    ActivityLog logActivity(String action, String details, String entityType, String entityId, String username);
    Page<ActivityLog> getActivityFeed(Map<String, String> filters, Pageable pageable);
    byte[] exportActivities(Map<String, String> filters, String format);
}
