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
import com.example.tasksmanage.service.SearchAnalyticsService;
import java.util.*;

@Service
public class SearchServiceImpl implements SearchService {
    @Autowired
    private SearchAnalyticsService searchAnalyticsService;

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
        // Log search analytics (if user is authenticated)
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof com.example.tasksmanage.model.User user) {
            searchAnalyticsService.logSearch(query, user);
        }

        Map<String, Object> result = new HashMap<>();
        // Tasks
        List<Task> tasks = taskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
        // Basic ranking: title exact > title contains > description contains > rest
        tasks = tasks.stream()
            .sorted(Comparator.comparingInt(t -> {
                String q = query.toLowerCase();
                if (t.getTitle() != null && t.getTitle().equalsIgnoreCase(query)) return 0;
                if (t.getTitle() != null && t.getTitle().toLowerCase().contains(q)) return 1;
                if (t.getDescription() != null && t.getDescription().toLowerCase().contains(q)) return 2;
                return 3;
            }))
            .toList();
        result.put("tasks", tasks);
        // Projects (assume Project has getName/getDescription)
        List<Project> projects = projectRepository.findAll().stream()
            .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(query.toLowerCase())) ||
                         (p.getDescription() != null && p.getDescription().toLowerCase().contains(query.toLowerCase())))
            .sorted(Comparator.comparingInt(p -> {
                String q = query.toLowerCase();
                if (p.getName() != null && p.getName().equalsIgnoreCase(query)) return 0;
                if (p.getName() != null && p.getName().toLowerCase().contains(q)) return 1;
                if (p.getDescription() != null && p.getDescription().toLowerCase().contains(q)) return 2;
                return 3;
            }))
            .toList();
        result.put("projects", projects);
        // Users (search by email, username, firstName, lastName)
        List<User> users = userRepository.findUsersBySearchTerm(query, PageRequest.of(0, 10)).getContent();
        users = users.stream()
            .sorted(Comparator.comparingInt(u -> {
                String q = query.toLowerCase();
                if (u.getUsername() != null && u.getUsername().equalsIgnoreCase(query)) return 0;
                if (u.getEmail() != null && u.getEmail().equalsIgnoreCase(query)) return 1;
                if (u.getUsername() != null && u.getUsername().toLowerCase().contains(q)) return 2;
                if (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)) return 3;
                if (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(q)) return 4;
                if (u.getLastName() != null && u.getLastName().toLowerCase().contains(q)) return 5;
                return 6;
            }))
            .toList();
        result.put("users", users);
        // Comments (assume Comment has getContent())
        List<Comment> comments = commentRepository.findAll().stream()
            .filter(c -> c.getContent() != null && c.getContent().toLowerCase().contains(query.toLowerCase()))
            .sorted(Comparator.comparingInt(c -> {
                String q = query.toLowerCase();
                if (c.getContent() != null && c.getContent().equalsIgnoreCase(query)) return 0;
                if (c.getContent() != null && c.getContent().toLowerCase().contains(q)) return 1;
                return 2;
            }))
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
        List<User> users = userRepository.findUsersBySearchTerm(query, PageRequest.of(0, 10)).getContent();
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
