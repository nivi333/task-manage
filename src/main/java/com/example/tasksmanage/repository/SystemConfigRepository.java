package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, UUID> {
    Optional<SystemConfig> findByKeyName(String keyName);
}
