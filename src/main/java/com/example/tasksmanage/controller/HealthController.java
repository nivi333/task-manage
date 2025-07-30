package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HealthController {
    @GetMapping("/health")
    public ApiResponse<String> health() {
        return new ApiResponse<>(true, "API is healthy", "OK");
    }
}
