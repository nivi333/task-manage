package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.SearchAnalytics;
import com.example.tasksmanage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SearchAnalyticsRepository extends JpaRepository<SearchAnalytics, UUID> {
    List<SearchAnalytics> findByUser(User user);
}
