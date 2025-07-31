package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.UUID;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID>, JpaSpecificationExecutor<ActivityLog> {
    // Filtering and search handled by specifications
    long countByUserIdAndAction(UUID userId, String action);
}
