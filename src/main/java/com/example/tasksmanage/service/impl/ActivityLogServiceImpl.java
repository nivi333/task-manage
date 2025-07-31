package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.ActivityLog;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.repository.ActivityLogRepository;
import com.example.tasksmanage.repository.UserRepository;
import com.example.tasksmanage.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {
    @Autowired
    private ActivityLogRepository activityLogRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public ActivityLog logActivity(String action, String details, String entityType, String entityId, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        ActivityLog log = new ActivityLog();
        log.setAction(action);
        log.setDetails(details);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setUser(user);
        log.setTimestamp(new Date());
        return activityLogRepository.save(log);
    }

    @Override
    public Page<ActivityLog> getActivityFeed(Map<String, String> filters, Pageable pageable) {
        // Filtering by user, action, entityType, entityId, date, etc. using Specification
        Specification<ActivityLog> spec = ActivityLogSpecifications.fromFilters(filters);
        return activityLogRepository.findAll(spec, pageable);
    }

    @Override
    public byte[] exportActivities(Map<String, String> filters, String format) {
        List<ActivityLog> logs = getActivityFeed(filters, Pageable.unpaged()).getContent();
        // Export logic for CSV/JSON
        if ("csv".equalsIgnoreCase(format)) {
            return ActivityLogExportUtil.toCsv(logs).getBytes();
        } else {
            return ActivityLogExportUtil.toJson(logs).getBytes();
        }
    }
}
