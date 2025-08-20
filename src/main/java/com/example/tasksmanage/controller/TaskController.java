package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.*;
import com.example.tasksmanage.service.TaskService;
import com.example.tasksmanage.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;
import java.util.Set;
import java.util.Date;
import java.time.Instant;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {
    @Autowired
    private TaskService taskService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskCreateDTO dto, Principal principal) {
        if (!com.example.tasksmanage.util.InputValidationUtil.isValidString(dto.getTitle(), 1, 255)) {
            return ResponseEntity.badRequest().build();
        }
        if (!com.example.tasksmanage.util.InputValidationUtil.isValidString(dto.getDescription(), 0, 2000)) {
            return ResponseEntity.badRequest().build();
        }
        UUID creatorId = null;
        if (principal != null) {
            String name = principal.getName();
            try {
                creatorId = UUID.fromString(name);
            } catch (IllegalArgumentException ex) {
                // Try to resolve by username then email when principal name is not a UUID
                creatorId = userRepository.findByUsername(name).map(u -> u.getId())
                        .or(() -> userRepository.findByEmail(name).map(u -> u.getId()))
                        .orElse(null);
            }
        }
        return ResponseEntity.status(201).body(taskService.createTask(dto, creatorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> getTask(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(@PathVariable UUID id, @Valid @RequestBody TaskCreateDTO dto) {
        if (!com.example.tasksmanage.util.InputValidationUtil.isValidString(dto.getTitle(), 1, 255)) {
            return ResponseEntity.badRequest().build();
        }
        if (!com.example.tasksmanage.util.InputValidationUtil.isValidString(dto.getDescription(), 0, 2000)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TaskResponseDTO> assignTask(@PathVariable UUID id, @RequestBody TaskAssignmentDTO dto, Principal principal) {
        UUID actingUserId = null;
        if (principal != null) {
            String name = principal.getName();
            try {
                actingUserId = UUID.fromString(name);
            } catch (IllegalArgumentException ex) {
                // When principal is not a UUID, attempt resolution via username then email
                actingUserId = userRepository.findByUsername(name).map(u -> u.getId())
                        .or(() -> userRepository.findByEmail(name).map(u -> u.getId()))
                        .orElse(null);
            }
        }
        return ResponseEntity.ok(taskService.assignTask(id, dto, actingUserId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponseDTO> updateStatus(@PathVariable UUID id, @Valid @RequestBody TaskStatusUpdateDTO dto) {
        return ResponseEntity.ok(taskService.updateStatus(id, dto));
    }

    @GetMapping
    public ResponseEntity<Page<TaskResponseDTO>> listTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) UUID assignedTo,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) Set<String> tags,
            @RequestParam(required = false) String dueDateFrom,
            @RequestParam(required = false) String dueDateTo,
            @RequestParam(required = false) String createdAtFrom,
            @RequestParam(required = false) String createdAtTo,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID teamId,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        TaskFilterDTO filter = new TaskFilterDTO();
        filter.setStatus(status);
        filter.setPriority(priority);
        filter.setAssignedTo(assignedTo);
        filter.setProjectId(projectId);
        filter.setTags(tags);
        filter.setSearch(search);
        filter.setSortBy(sortBy);
        filter.setSortDir(sortDir);
        filter.setPage(page);
        filter.setSize(size);
        // Set teamId for team filtering
        if (teamId != null) {
            filter.setTeamId(teamId);
        }
        // Date parsing for dueDateFrom, dueDateTo, createdAtFrom, createdAtTo
        try {
            if (dueDateFrom != null) filter.setDueDateFrom(Date.from(Instant.parse(dueDateFrom)));
            if (dueDateTo != null) filter.setDueDateTo(Date.from(Instant.parse(dueDateTo)));
            if (createdAtFrom != null) filter.setCreatedAtFrom(Date.from(Instant.parse(createdAtFrom)));
            if (createdAtTo != null) filter.setCreatedAtTo(Date.from(Instant.parse(createdAtTo)));
        } catch (DateTimeParseException ignored) {}
        return ResponseEntity.ok(taskService.advancedListTasks(filter));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<TaskResponseDTO>> listMyTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) Set<String> tags,
            @RequestParam(required = false) String dueDateFrom,
            @RequestParam(required = false) String dueDateTo,
            @RequestParam(required = false) String createdAtFrom,
            @RequestParam(required = false) String createdAtTo,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal
    ) {
        // Resolve acting user ID from principal using UUID -> username -> email
        UUID actingUserId = null;
        if (principal != null) {
            String name = principal.getName();
            try {
                actingUserId = java.util.UUID.fromString(name);
            } catch (IllegalArgumentException ex) {
                actingUserId = userRepository.findByUsername(name).map(u -> u.getId())
                        .or(() -> userRepository.findByEmail(name).map(u -> u.getId()))
                        .orElse(null);
            }
        }
        if (actingUserId == null) {
            return ResponseEntity.status(401).build();
        }

        TaskFilterDTO filter = new TaskFilterDTO();
        filter.setStatus(status);
        filter.setPriority(priority);
        filter.setAssignedTo(actingUserId);
        filter.setProjectId(projectId);
        filter.setTags(tags);
        filter.setSearch(search);
        filter.setSortBy(sortBy);
        filter.setSortDir(sortDir);
        filter.setPage(page);
        filter.setSize(size);
        try {
            if (dueDateFrom != null) filter.setDueDateFrom(java.util.Date.from(java.time.Instant.parse(dueDateFrom)));
            if (dueDateTo != null) filter.setDueDateTo(java.util.Date.from(java.time.Instant.parse(dueDateTo)));
            if (createdAtFrom != null) filter.setCreatedAtFrom(java.util.Date.from(java.time.Instant.parse(createdAtFrom)));
            if (createdAtTo != null) filter.setCreatedAtTo(java.util.Date.from(java.time.Instant.parse(createdAtTo)));
        } catch (java.time.format.DateTimeParseException ignored) {}

        return ResponseEntity.ok(taskService.advancedListTasks(filter));
    }
}
