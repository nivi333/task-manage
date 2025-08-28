package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.ProjectCreateDTO;
import com.example.tasksmanage.dto.ProjectDTO;
import com.example.tasksmanage.model.ProjectStatus;
import com.example.tasksmanage.service.ProjectService;
import com.example.tasksmanage.dto.ProjectMemberDTO;
import com.example.tasksmanage.dto.ProjectMemberAddRequest;
import com.example.tasksmanage.model.ProjectMemberRole;
import com.example.tasksmanage.service.ProjectMemberService;
import com.example.tasksmanage.service.ProjectInvitationService;
import com.example.tasksmanage.dto.ProjectInvitationRequest;
import com.example.tasksmanage.dto.ProjectInvitationDTO;
import com.example.tasksmanage.model.ProjectAuditLog;
import com.example.tasksmanage.repository.ProjectAuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.tasksmanage.service.ProjectAnalyticsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import com.example.tasksmanage.model.User;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {
    @Autowired
    private ProjectService projectService;
    @Autowired
    private ProjectMemberService projectMemberService;
    @Autowired
    private ProjectInvitationService projectInvitationService;
    @Autowired
    private ProjectAuditLogRepository auditLogRepository;
    @Autowired
    private ProjectAnalyticsService projectAnalyticsService;

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@RequestBody ProjectCreateDTO dto,
                                                    @AuthenticationPrincipal User currentUser) {
        // Ensure creator is set as owner if not provided
        if (dto.getOwnerId() == null && currentUser != null && currentUser.getId() != null) {
            dto.setOwnerId(currentUser.getId());
        }
        // Ensure creator/owner is part of team members
        if (dto.getTeamMemberIds() == null) {
            dto.setTeamMemberIds(new HashSet<>());
        }
        if (dto.getOwnerId() != null) {
            dto.getTeamMemberIds().add(dto.getOwnerId());
        } else if (currentUser != null && currentUser.getId() != null) {
            dto.getTeamMemberIds().add(currentUser.getId());
        }
        return ResponseEntity.ok(projectService.createProject(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProject(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> listProjects(Authentication authentication) {
        UUID userId = getUserId(authentication);
        if (userId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(projectService.listProjectsForUser(userId));
    }

    private UUID getUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            try {
                java.lang.reflect.Method getId = userDetails.getClass().getMethod("getId");
                Object id = getId.invoke(userDetails);
                if (id instanceof UUID) return (UUID) id;
                if (id instanceof String s) {
                    try { return UUID.fromString(s); } catch (Exception ignored) {}
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable UUID id, @RequestBody ProjectCreateDTO dto) {
        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProjectDTO> updateStatus(@PathVariable UUID id, @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(projectService.updateStatus(id, req.getStatus()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }

    public static class StatusUpdateRequest {
        private ProjectStatus status;
        public ProjectStatus getStatus() { return status; }
        public void setStatus(ProjectStatus status) { this.status = status; }
    }

    // --- Project Member Management ---
    @GetMapping("/{id}/members")
    @PreAuthorize("@projectAccessEvaluator.isMember(authentication, #id)")
    public ResponseEntity<List<ProjectMemberDTO>> listMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(projectMemberService.listMembers(id));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("@projectAccessEvaluator.hasRole(authentication, #id, 'OWNER', 'MANAGER')")
    public ResponseEntity<List<ProjectMemberDTO>> addMembers(@PathVariable UUID id, @RequestBody ProjectMemberAddRequest req) {
        return ResponseEntity.ok(projectMemberService.addMembers(id, req));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("@projectAccessEvaluator.hasRole(authentication, #id, 'OWNER', 'MANAGER')")
    public ResponseEntity<Void> removeMember(@PathVariable UUID id, @PathVariable UUID userId) {
        projectMemberService.removeMember(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/members/{userId}/role")
    @PreAuthorize("@projectAccessEvaluator.hasRole(authentication, #id, 'OWNER', 'MANAGER')")
    public ResponseEntity<ProjectMemberDTO> updateMemberRole(@PathVariable UUID id, @PathVariable UUID userId, @RequestParam ProjectMemberRole role) {
        return ResponseEntity.ok(projectMemberService.updateRole(id, userId, role));
    }

    // --- Invitation System ---
    @PostMapping("/{id}/invitations")
    @PreAuthorize("@projectAccessEvaluator.hasRole(authentication, #id, 'OWNER', 'MANAGER')")
    public ResponseEntity<ProjectInvitationDTO> sendInvitation(
            @PathVariable UUID id,
            @RequestBody ProjectInvitationRequest req,
            @RequestHeader("X-User-Id") UUID actingUserId) {
        return ResponseEntity.ok(projectInvitationService.sendInvitation(id, req, actingUserId));
    }

    @PostMapping("/{id}/invitations/{token}/accept")
    public ResponseEntity<ProjectMemberDTO> acceptInvitation(
            @PathVariable UUID id,
            @PathVariable String token,
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(projectInvitationService.acceptInvitation(id, token, userId));
    }

    // --- Analytics ---
    // Backward-compatible dashboard endpoint (without /analytics prefix)
    @GetMapping("/{id}/dashboard")
    public ResponseEntity<Map<String, Object>> getProjectDashboardCompat(@PathVariable UUID id) {
        return ResponseEntity.ok(projectAnalyticsService.getDashboard(id));
    }

    @GetMapping("/{id}/analytics/dashboard")
    public ResponseEntity<Map<String, Object>> getProjectDashboard(@PathVariable UUID id) {
        return ResponseEntity.ok(projectAnalyticsService.getDashboard(id));
    }

    @GetMapping("/{id}/analytics/burndown")
    public ResponseEntity<List<Map<String, Object>>> getProjectBurndown(@PathVariable UUID id) {
        return ResponseEntity.ok(projectAnalyticsService.getBurndown(id));
    }

    @GetMapping("/{id}/analytics/timeline")
    @PreAuthorize("@projectAccessEvaluator.isMember(authentication, #id)")
    public ResponseEntity<List<Map<String, Object>>> getProjectTimeline(@PathVariable UUID id) {
        return ResponseEntity.ok(projectAnalyticsService.getTimeline(id));
    }

    @GetMapping("/{id}/analytics/workload")
    @PreAuthorize("@projectAccessEvaluator.isMember(authentication, #id)")
    public ResponseEntity<Map<String, Long>> getProjectWorkload(@PathVariable UUID id) {
        return ResponseEntity.ok(projectAnalyticsService.getWorkload(id));
    }

    @GetMapping("/{id}/analytics/completion-budget")
    @PreAuthorize("@projectAccessEvaluator.isMember(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getProjectCompletionBudget(@PathVariable UUID id) {
        return ResponseEntity.ok(projectAnalyticsService.getCompletionAndBudget(id));
    }

    // --- Audit Logs ---
    @GetMapping("/{id}/audit-logs")
    @PreAuthorize("@projectAccessEvaluator.isMember(authentication, #id)")
    public ResponseEntity<List<ProjectAuditLog>> getAuditLogs(@PathVariable UUID id) {
        return ResponseEntity.ok(auditLogRepository.findByProjectId(id));
    }
}

