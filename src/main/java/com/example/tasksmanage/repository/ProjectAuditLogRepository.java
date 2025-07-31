package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.ProjectAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectAuditLogRepository extends JpaRepository<ProjectAuditLog, UUID> {
    List<ProjectAuditLog> findByProjectId(UUID projectId);
}
