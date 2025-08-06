package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {
    Optional<ApiKey> findByApiKey(String apiKey);
    List<ApiKey> findByUserId(UUID userId);
}
