package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.WebhookEventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface WebhookEventLogRepository extends JpaRepository<WebhookEventLog, UUID> {
}
