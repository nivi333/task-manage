package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.SavedSearch;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.service.SavedSearchService;
import com.example.tasksmanage.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/saved-searches")
public class SavedSearchController {
    @Autowired
    private SavedSearchService savedSearchService;
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<SavedSearch>> getSavedSearches(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(savedSearchService.getSavedSearches(user));
    }

    @PostMapping
    public ResponseEntity<SavedSearch> saveSearch(@AuthenticationPrincipal User user, @RequestBody SavedSearch search) {
        search.setUser(user);
        return ResponseEntity.ok(savedSearchService.saveSearch(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavedSearch> getSearchById(@PathVariable UUID id) {
        Optional<SavedSearch> search = savedSearchService.getSearchById(id);
        return search.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSearch(@PathVariable UUID id) {
        savedSearchService.deleteSearch(id);
        return ResponseEntity.noContent().build();
    }
}
