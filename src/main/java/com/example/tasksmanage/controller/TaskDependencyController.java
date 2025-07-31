package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.TaskDependency;
import com.example.tasksmanage.repository.TaskDependencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/task-dependencies")
public class TaskDependencyController {
    @Autowired
    private TaskDependencyRepository taskDependencyRepository;

    @GetMapping
    public List<TaskDependency> listDependencies() {
        return taskDependencyRepository.findAll();
    }

    @PostMapping
    public TaskDependency createDependency(@RequestBody TaskDependency dependency) {
        return taskDependencyRepository.save(dependency);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDependency> getDependency(@PathVariable UUID id) {
        return taskDependencyRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDependency(@PathVariable UUID id) {
        if (!taskDependencyRepository.existsById(id)) return ResponseEntity.notFound().build();
        taskDependencyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
