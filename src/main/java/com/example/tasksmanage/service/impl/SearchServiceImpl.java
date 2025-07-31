package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.Task;
import com.example.tasksmanage.repository.TaskRepository;
import com.example.tasksmanage.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SearchServiceImpl implements SearchService {
    @Autowired
    private TaskRepository taskRepository;

    @Override
    public Map<String, Object> globalSearch(String query) {
        // Demo: search tasks by name/description (expand to projects, users, comments, etc.)
        List<Task> tasks = taskRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
        Map<String, Object> result = new HashMap<>();
        result.put("tasks", tasks);
        // TODO: add projects, users, comments, etc.
        return result;
    }

    @Override
    public Map<String, Object> advancedTaskSearch(Map<String, String> params) {
        // Demo: filter tasks by status, priority, assignee, project, team, tags
        // TODO: Implement with JPA Criteria or Specification, or Hibernate Search/ElasticSearch
        List<Task> tasks = taskRepository.advancedSearch(params);
        Map<String, Object> result = new HashMap<>();
        result.put("tasks", tasks);
        return result;
    }
}
