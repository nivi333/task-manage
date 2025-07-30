package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.UserAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UserAuditLogRepository extends JpaRepository<UserAuditLog, UUID> {
    // Custom queries can be added here if needed
}
