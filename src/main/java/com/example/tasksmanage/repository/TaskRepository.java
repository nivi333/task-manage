package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Task> {
    // Global text search (name/description)
    java.util.List<Task> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    // Placeholder for advanced search (to be implemented with Specification or Criteria API)
    default java.util.List<Task> advancedSearch(java.util.Map<String, String> params) {
        // TODO: Implement with JPA Specification, Criteria API, or Hibernate Search/ElasticSearch
        return findAll();
    }

    java.util.List<Task> findByProjectId(UUID projectId);
    java.util.List<Task> findByAssignedTo_Id(UUID assigneeId);
}
