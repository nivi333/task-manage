package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.Webhook;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WebhookRepository extends JpaRepository<Webhook, UUID> {
    List<Webhook> findByActiveTrue();
}
