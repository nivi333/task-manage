package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.Task;
import com.example.tasksmanage.model.Project;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.model.Comment;
import com.example.tasksmanage.repository.TaskRepository;
import com.example.tasksmanage.repository.ProjectRepository;
import com.example.tasksmanage.repository.UserRepository;
import com.example.tasksmanage.repository.CommentRepository;
import com.example.tasksmanage.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SearchServiceImpl implements SearchService {
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CommentRepository commentRepository;

    @Override
    public Map<String, Object> globalSearch(String query) {
        Map<String, Object> result = new HashMap<>();
        // Tasks
        List<Task> tasks = taskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
        result.put("tasks", tasks);
        // Projects (assume Project has getName/getDescription)
        List<Project> projects = projectRepository.findAll().stream()
            .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(query.toLowerCase())) ||
                         (p.getDescription() != null && p.getDescription().toLowerCase().contains(query.toLowerCase())))
            .toList();
        result.put("projects", projects);
        // Users (search by email, username, firstName, lastName)
        List<User> users = userRepository.findByEmailContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            query, query, query, query, PageRequest.of(0, 10)).getContent();
        result.put("users", users);
        // Comments (assume Comment has getContent())
        List<Comment> comments = commentRepository.findAll().stream()
            .filter(c -> c.getContent() != null && c.getContent().toLowerCase().contains(query.toLowerCase()))
            .toList();
        result.put("comments", comments);
        return result;
    }

    @Override
    public Map<String, Object> advancedTaskSearch(Map<String, String> params) {
        // Support advanced filtering via TaskRepository.advancedSearch
        List<Task> tasks = taskRepository.advancedSearch(params);
        Map<String, Object> result = new HashMap<>();
        result.put("tasks", tasks);
        return result;
    }

    @Override
    public Map<String, List<String>> autocomplete(String query) {
        Map<String, List<String>> result = new HashMap<>();
        // Task titles
        List<String> taskTitles = taskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query)
            .stream().map(t -> t.getTitle()).filter(Objects::nonNull)
            .filter(t -> t.toLowerCase().contains(query.toLowerCase()))
            .distinct().limit(10).toList();
        result.put("tasks", taskTitles);
        // Project names
        List<String> projectNames = projectRepository.findAll().stream()
            .map(p -> p.getName()).filter(Objects::nonNull)
            .filter(n -> n.toLowerCase().contains(query.toLowerCase()))
            .distinct().limit(10).toList();
        result.put("projects", projectNames);
        // User usernames/emails/names
        List<User> users = userRepository.findByEmailContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            query, query, query, query, org.springframework.data.domain.PageRequest.of(0, 10)).getContent();
        Set<String> userSuggestions = new LinkedHashSet<>();
        for (User u : users) {
            if (u.getUsername() != null && u.getUsername().toLowerCase().contains(query.toLowerCase())) userSuggestions.add(u.getUsername());
            if (u.getEmail() != null && u.getEmail().toLowerCase().contains(query.toLowerCase())) userSuggestions.add(u.getEmail());
            if (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(query.toLowerCase())) userSuggestions.add(u.getFirstName());
            if (u.getLastName() != null && u.getLastName().toLowerCase().contains(query.toLowerCase())) userSuggestions.add(u.getLastName());
        }
        result.put("users", new ArrayList<>(userSuggestions).subList(0, Math.min(10, userSuggestions.size())));
        return result;
    }
}
