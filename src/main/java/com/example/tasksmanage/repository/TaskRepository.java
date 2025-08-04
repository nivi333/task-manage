package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.Task;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Task> {
    // Global text search (name/description)
    java.util.List<Task> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    // Advanced search using Specification for dynamic filtering
    default java.util.List<Task> advancedSearch(java.util.Map<String, String> params) {
        Specification<Task> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (params.containsKey("status"))
                predicates.add(cb.equal(root.get("status"), params.get("status")));
            if (params.containsKey("priority"))
                predicates.add(cb.equal(root.get("priority"), params.get("priority")));
            if (params.containsKey("assignedTo"))
                predicates.add(cb.equal(root.get("assignedTo").get("id"), java.util.UUID.fromString(params.get("assignedTo"))));
            if (params.containsKey("projectId"))
                predicates.add(cb.equal(root.get("project").get("id"), java.util.UUID.fromString(params.get("projectId"))));
            if (params.containsKey("tags")) {
                String[] tags = params.get("tags").split(",");
                for (String tag : tags) {
                    predicates.add(cb.isMember(tag.trim(), root.get("tags")));
                }
            }
            if (params.containsKey("dueDateFrom"))
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), java.sql.Date.valueOf(params.get("dueDateFrom"))));
            if (params.containsKey("dueDateTo"))
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), java.sql.Date.valueOf(params.get("dueDateTo"))));
            if (params.containsKey("createdAtFrom"))
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), java.sql.Date.valueOf(params.get("createdAtFrom"))));
            if (params.containsKey("createdAtTo"))
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), java.sql.Date.valueOf(params.get("createdAtTo"))));
            if (params.containsKey("q")) {
                String q = params.get("q");
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), "%" + q.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + q.toLowerCase() + "%")
                ));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        if (this instanceof org.springframework.data.jpa.repository.JpaSpecificationExecutor<?>) {
            return ((org.springframework.data.jpa.repository.JpaSpecificationExecutor<Task>) this).findAll(spec);
        } else {
            return findAll();
        }
    }

    java.util.List<Task> findByProjectId(UUID projectId);
    java.util.List<Task> findByAssignedTo_Id(UUID assigneeId);
}
