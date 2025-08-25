package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.dto.admin.AdminStatsDTO;
import com.example.tasksmanage.model.SystemConfig;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.model.UserAuditLog;
import com.example.tasksmanage.repository.*;
import com.example.tasksmanage.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AdminServiceImpl implements AdminService {
    @Autowired private UserRepository userRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private TeamRepository teamRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserAuditLogRepository userAuditLogRepository;
    @Autowired private SystemConfigRepository systemConfigRepository;

    @Override
    public AdminStatsDTO getStats() {
        AdminStatsDTO dto = new AdminStatsDTO();
        dto.users = userRepository.count();
        dto.projects = projectRepository.count();
        dto.tasks = taskRepository.count();
        dto.teams = teamRepository.count();
        dto.comments = commentRepository.count();
        dto.notifications = notificationRepository.count();
        return dto;
    }

    @Override
    public List<UserAuditLog> getAuditLogs(int page, int size) {
        return userAuditLogRepository.findAll(PageRequest.of(page, size)).getContent();
    }

    @Override
    public SystemConfig getConfig(String key) {
        return systemConfigRepository.findByKeyName(key).orElse(null);
    }

    @Override
    public SystemConfig updateConfig(String key, String jsonValue, UUID actorId) {
        SystemConfig cfg = systemConfigRepository.findByKeyName(key).orElseGet(SystemConfig::new);
        cfg.setKeyName(key);
        cfg.setJsonValue(jsonValue);
        cfg.setUpdatedAt(OffsetDateTime.now());
        if (actorId != null) {
            // Lightweight reference without fetching user; optional improvement: fetch entity
            User u = new User();
            u.setId(actorId);
            cfg.setUpdatedBy(u);
        }
        return systemConfigRepository.save(cfg);
    }
}
