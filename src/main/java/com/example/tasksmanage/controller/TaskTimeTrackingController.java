package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.TaskTimeTracking;
import com.example.tasksmanage.repository.TaskTimeTrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/task-time-tracking")
public class TaskTimeTrackingController {
    @Autowired
    private TaskTimeTrackingRepository taskTimeTrackingRepository;

    @GetMapping
    public List<TaskTimeTracking> listTimeTracking() {
        return taskTimeTrackingRepository.findAll();
    }

    @PostMapping
    public TaskTimeTracking createTimeTracking(@RequestBody TaskTimeTracking timeTracking) {
        return taskTimeTrackingRepository.save(timeTracking);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskTimeTracking> getTimeTracking(@PathVariable UUID id) {
        return taskTimeTrackingRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimeTracking(@PathVariable UUID id) {
        if (!taskTimeTrackingRepository.existsById(id)) return ResponseEntity.notFound().build();
        taskTimeTrackingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
