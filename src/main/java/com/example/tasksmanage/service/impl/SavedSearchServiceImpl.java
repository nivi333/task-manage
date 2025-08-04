package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.SavedSearch;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.repository.SavedSearchRepository;
import com.example.tasksmanage.service.SavedSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SavedSearchServiceImpl implements SavedSearchService {
    @Autowired
    private SavedSearchRepository savedSearchRepository;

    @Override
    public SavedSearch saveSearch(SavedSearch search) {
        return savedSearchRepository.save(search);
    }

    @Override
    public List<SavedSearch> getSavedSearches(User user) {
        return savedSearchRepository.findByUser(user);
    }

    @Override
    public Optional<SavedSearch> getSearchById(UUID id) {
        return savedSearchRepository.findById(id);
    }

    @Override
    public void deleteSearch(UUID id) {
        savedSearchRepository.deleteById(id);
    }
}
