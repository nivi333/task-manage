package com.example.tasksmanage.service;

import com.example.tasksmanage.dto.*;
import com.example.tasksmanage.model.*;
import com.example.tasksmanage.repository.TaskRepository;
import com.example.tasksmanage.repository.UserRepository;
import com.example.tasksmanage.repository.ProjectRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;

    public TaskResponseDTO toDTO(Task task) {
        TaskResponseDTO dto = new TaskResponseDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setEstimatedHours(task.getEstimatedHours());
        dto.setActualHours(task.getActualHours());
        dto.setCreatedBy(task.getCreatedBy() != null ? task.getCreatedBy().getId() : null);
        dto.setAssignedTo(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null);
        dto.setProjectId(task.getProject() != null ? task.getProject().getId() : null);
        dto.setTags(task.getTags());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }

    @Transactional
    public TaskResponseDTO createTask(TaskCreateDTO dto, UUID creatorId) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setDueDate(dto.getDueDate());
        task.setEstimatedHours(dto.getEstimatedHours());
        task.setActualHours(dto.getActualHours());
        task.setTags(dto.getTags() != null ? dto.getTags() : new HashSet<>());
        task.setCreatedAt(new Date());
        task.setUpdatedAt(new Date());
        if (creatorId != null) {
            userRepository.findById(creatorId).ifPresent(task::setCreatedBy);
        }
        if (dto.getAssignedTo() != null) {
            userRepository.findById(dto.getAssignedTo()).ifPresent(task::setAssignedTo);
        }
        if (dto.getProjectId() != null) {
            projectRepository.findById(dto.getProjectId()).ifPresent(task::setProject);
        }
        taskRepository.save(task);
        return toDTO(task);
    }

    public TaskResponseDTO getTask(UUID id) {
        return taskRepository.findById(id).map(this::toDTO)
                .orElseThrow(() -> new NoSuchElementException("Task not found"));
    }

    @Transactional
    public TaskResponseDTO updateTask(UUID id, TaskCreateDTO dto) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Task not found"));
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setDueDate(dto.getDueDate());
        task.setEstimatedHours(dto.getEstimatedHours());
        task.setActualHours(dto.getActualHours());
        task.setTags(dto.getTags() != null ? dto.getTags() : new HashSet<>());
        task.setUpdatedAt(new Date());
        if (dto.getAssignedTo() != null) {
            userRepository.findById(dto.getAssignedTo()).ifPresent(task::setAssignedTo);
        }
        if (dto.getProjectId() != null) {
            projectRepository.findById(dto.getProjectId()).ifPresent(task::setProject);
        }
        taskRepository.save(task);
        return toDTO(task);
    }

    @Transactional
    public void deleteTask(UUID id) {
        taskRepository.deleteById(id);
    }

    @Transactional
    public TaskResponseDTO updateStatus(UUID id, TaskStatusUpdateDTO dto) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Task not found"));
        task.setStatus(dto.getStatus());
        task.setUpdatedAt(new Date());
        taskRepository.save(task);
        return toDTO(task);
    }

    public Page<TaskResponseDTO> listTasks(int page, int size) {
        return taskRepository.findAll(PageRequest.of(page, size)).map(this::toDTO);
    }

    public Page<TaskResponseDTO> advancedListTasks(TaskFilterDTO filter) {
        // Build dynamic query using Specification (JPA Criteria API)
        org.springframework.data.jpa.domain.Specification<Task> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (filter.getStatus() != null) predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            if (filter.getPriority() != null) predicates.add(cb.equal(root.get("priority"), filter.getPriority()));
            if (filter.getAssignedTo() != null) predicates.add(cb.equal(root.get("assignedTo").get("id"), filter.getAssignedTo()));
            if (filter.getProjectId() != null) predicates.add(cb.equal(root.get("project").get("id"), filter.getProjectId()));
            if (filter.getDueDateFrom() != null) predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), filter.getDueDateFrom()));
            if (filter.getDueDateTo() != null) predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), filter.getDueDateTo()));
            if (filter.getCreatedAtFrom() != null) predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getCreatedAtFrom()));
            if (filter.getCreatedAtTo() != null) predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getCreatedAtTo()));
            if (filter.getTags() != null && !filter.getTags().isEmpty()) predicates.add(root.join("tags").in(filter.getTags()));
            if (filter.getSearch() != null && !filter.getSearch().isEmpty()) {
                String like = "%" + filter.getSearch().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("description")), like)
                ));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            filter.getPage(),
            filter.getSize(),
            "desc".equalsIgnoreCase(filter.getSortDir()) ? org.springframework.data.domain.Sort.by(filter.getSortBy()).descending() : org.springframework.data.domain.Sort.by(filter.getSortBy()).ascending()
        );
        if (taskRepository instanceof org.springframework.data.jpa.repository.JpaSpecificationExecutor<?>) {
            org.springframework.data.domain.Page<Task> page = ((org.springframework.data.jpa.repository.JpaSpecificationExecutor<Task>) taskRepository).findAll(spec, pageable);
            return page.map(this::toDTO);
        } else {
            // fallback: return all
            return taskRepository.findAll(pageable).map(this::toDTO);
        }
    }

    @Transactional
    public TaskResponseDTO assignTask(UUID taskId, TaskAssignmentDTO dto, UUID actingUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NoSuchElementException("Task not found"));
        // Ownership/role validation: Only creator, current assignee, or admin can assign/reassign
        if (actingUserId != null) {
            boolean isOwner = task.getCreatedBy() != null && actingUserId.equals(task.getCreatedBy().getId());
            boolean isAssignee = task.getAssignedTo() != null && actingUserId.equals(task.getAssignedTo().getId());
            // TODO: Add admin/role check if available
            if (!isOwner && !isAssignee) {
                throw new SecurityException("Not authorized to assign/reassign this task");
            }
        }
        // Delegation logic
        if (dto.getDelegatedBy() != null && (task.getAssignedTo() == null || !dto.getDelegatedBy().equals(task.getAssignedTo().getId()))) {
            throw new SecurityException("Delegation only allowed by current assignee");
        }
        if (dto.getAssignedTo() != null) {
            userRepository.findById(dto.getAssignedTo()).ifPresent(task::setAssignedTo);
        }
        task.setUpdatedAt(new Date());
        taskRepository.save(task);
        // Notification stub (implement as needed)
        if (Boolean.TRUE.equals(dto.getNotifyUser())) {
            // e.g., notificationService.notifyAssignment(task, dto.getAssignedTo());
        }
        return toDTO(task);
    }
}
