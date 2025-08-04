package com.example.tasksmanage.service;

import com.example.tasksmanage.model.SavedSearch;
import com.example.tasksmanage.model.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedSearchService {
    SavedSearch saveSearch(SavedSearch search);
    List<SavedSearch> getSavedSearches(User user);
    Optional<SavedSearch> getSearchById(UUID id);
    void deleteSearch(UUID id);
}
