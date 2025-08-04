package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.SearchAnalytics;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.repository.SearchAnalyticsRepository;
import com.example.tasksmanage.service.SearchAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SearchAnalyticsServiceImpl implements SearchAnalyticsService {
    @Autowired
    private SearchAnalyticsRepository searchAnalyticsRepository;

    @Override
    public void logSearch(String query, User user) {
        SearchAnalytics analytics = new SearchAnalytics();
        analytics.setQuery(query);
        analytics.setUser(user);
        searchAnalyticsRepository.save(analytics);
    }

    @Override
    public List<SearchAnalytics> getUserSearches(User user) {
        return searchAnalyticsRepository.findByUser(user);
    }
}
