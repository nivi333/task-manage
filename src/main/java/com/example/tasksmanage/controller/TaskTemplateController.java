package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.TaskTemplate;
import com.example.tasksmanage.repository.TaskTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/task-templates")
public class TaskTemplateController {
    @Autowired
    private TaskTemplateRepository taskTemplateRepository;

    @GetMapping
    public List<TaskTemplate> listTemplates() {
        return taskTemplateRepository.findAll();
    }

    @PostMapping
    public TaskTemplate createTemplate(@RequestBody TaskTemplate template) {
        template.setCreatedAt(new Date());
        template.setUpdatedAt(new Date());
        return taskTemplateRepository.save(template);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskTemplate> getTemplate(@PathVariable UUID id) {
        return taskTemplateRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskTemplate> updateTemplate(@PathVariable UUID id, @RequestBody TaskTemplate template) {
        return taskTemplateRepository.findById(id)
            .map(existing -> {
                template.setId(id);
                template.setCreatedAt(existing.getCreatedAt());
                template.setUpdatedAt(new Date());
                return ResponseEntity.ok(taskTemplateRepository.save(template));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        if (!taskTemplateRepository.existsById(id)) return ResponseEntity.notFound().build();
        taskTemplateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
