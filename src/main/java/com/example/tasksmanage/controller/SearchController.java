package com.example.tasksmanage.controller;

import com.example.tasksmanage.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class SearchController {
    @Autowired
    private SearchService searchService;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> globalSearch(@RequestParam("q") String query) {
        return ResponseEntity.ok(searchService.globalSearch(query));
    }

    @GetMapping("/tasks/search")
    public ResponseEntity<Map<String, Object>> advancedTaskSearch(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(searchService.advancedTaskSearch(params));
    }
}
