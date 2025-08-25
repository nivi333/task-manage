package com.example.tasksmanage.service;

import com.example.tasksmanage.dto.admin.AdminStatsDTO;
import com.example.tasksmanage.model.SystemConfig;
import com.example.tasksmanage.model.UserAuditLog;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    AdminStatsDTO getStats();
    List<UserAuditLog> getAuditLogs(int page, int size);
    SystemConfig getConfig(String key);
    SystemConfig updateConfig(String key, String jsonValue, UUID actorId);
}
