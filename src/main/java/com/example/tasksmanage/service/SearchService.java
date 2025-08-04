package com.example.tasksmanage.service;

import java.util.Map;

public interface SearchService {
    Map<String, Object> globalSearch(String query);
    Map<String, Object> advancedTaskSearch(Map<String, String> params);
    Map<String, java.util.List<String>> autocomplete(String query);
}
