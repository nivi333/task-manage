package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.*;
import com.example.tasksmanage.service.TaskService;
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

    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskCreateDTO dto, Principal principal) {
        if (!com.example.tasksmanage.util.InputValidationUtil.isValidString(dto.getTitle(), 1, 255)) {
            return ResponseEntity.badRequest().build();
        }
        if (!com.example.tasksmanage.util.InputValidationUtil.isValidString(dto.getDescription(), 0, 2000)) {
            return ResponseEntity.badRequest().build();
        }
        UUID creatorId = principal != null ? UUID.fromString(principal.getName()) : null;
        return ResponseEntity.ok(taskService.createTask(dto, creatorId));
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
        UUID actingUserId = principal != null ? UUID.fromString(principal.getName()) : null;
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
}
