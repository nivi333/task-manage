package com.example.tasksmanage.security;

import com.example.tasksmanage.model.ProjectMemberRole;
import com.example.tasksmanage.service.ProjectMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ProjectAccessEvaluator {
    @Autowired
    private ProjectMemberService projectMemberService;

    public boolean isMember(Authentication authentication, UUID projectId) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        UUID userId = getUserId(authentication);
        return projectMemberService.listMembers(projectId).stream()
                .anyMatch(m -> m.getUserId().equals(userId));
    }

    public boolean hasRole(Authentication authentication, UUID projectId, String... roles) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        UUID userId = getUserId(authentication);
        return projectMemberService.listMembers(projectId).stream()
                .filter(m -> m.getUserId().equals(userId))
                .anyMatch(m -> java.util.Arrays.asList(roles).contains(m.getRole().name()));
    }

    private UUID getUserId(Authentication authentication) {
        // Assumes principal is user ID as String or a UserDetails with getId()
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            try {
                java.lang.reflect.Method getId = userDetails.getClass().getMethod("getId");
                Object id = getId.invoke(userDetails);
                if (id instanceof UUID) return (UUID) id;
                if (id instanceof String) return UUID.fromString((String) id);
            } catch (Exception ignored) {}
        }
        if (principal instanceof String s) {
            try { return UUID.fromString(s); } catch (Exception ignored) {}
        }
        return null;
    }
}
