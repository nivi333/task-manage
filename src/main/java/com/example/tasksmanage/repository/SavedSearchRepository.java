package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.SavedSearch;
import com.example.tasksmanage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SavedSearchRepository extends JpaRepository<SavedSearch, UUID> {
    List<SavedSearch> findByUser(User user);
}
