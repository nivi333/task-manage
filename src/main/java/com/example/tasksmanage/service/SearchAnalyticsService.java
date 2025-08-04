package com.example.tasksmanage.service;

import com.example.tasksmanage.model.SearchAnalytics;
import com.example.tasksmanage.model.User;
import java.util.List;

public interface SearchAnalyticsService {
    void logSearch(String query, User user);
    List<SearchAnalytics> getUserSearches(User user);
}
