package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.PasswordHistory;
import com.example.tasksmanage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, UUID> {
    List<PasswordHistory> findTop5ByUserOrderByChangedAtDesc(User user);
}
