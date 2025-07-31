package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.ActivityLog;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.*;
import java.util.Map;

public class ActivityLogSpecifications {
    public static Specification<ActivityLog> fromFilters(Map<String, String> filters) {
        return (Root<ActivityLog> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Predicate predicate = cb.conjunction();
            if (filters.containsKey("user")) {
                predicate = cb.and(predicate, cb.equal(root.get("user").get("username"), filters.get("user")));
            }
            if (filters.containsKey("action")) {
                predicate = cb.and(predicate, cb.equal(root.get("action"), filters.get("action")));
            }
            if (filters.containsKey("entityType")) {
                predicate = cb.and(predicate, cb.equal(root.get("entityType"), filters.get("entityType")));
            }
            if (filters.containsKey("entityId")) {
                predicate = cb.and(predicate, cb.equal(root.get("entityId"), filters.get("entityId")));
            }
            // Add date filtering if needed
            return predicate;
        };
    }
}
