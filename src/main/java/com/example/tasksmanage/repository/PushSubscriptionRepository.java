package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    Optional<PushSubscription> findByUserIdAndEndpoint(UUID userId, String endpoint);
}
