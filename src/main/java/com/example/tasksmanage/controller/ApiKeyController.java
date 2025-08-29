package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.ApiKey;
import com.example.tasksmanage.service.ApiKeyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/apikeys")
public class ApiKeyController {
    @Autowired
    private ApiKeyService apiKeyService;

    @PostMapping("/generate")
    public ResponseEntity<ApiKey> generate(@RequestParam String name) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No authenticated user found");
        }
        UUID userId = resolveUserId(authentication.getName());
        ApiKey apiKey = apiKeyService.generateApiKey(userId, name);
        return ResponseEntity.ok(apiKey);
    }

    private UUID resolveUserId(String principalName) {
        try {
            return UUID.fromString(principalName);
        } catch (IllegalArgumentException ex) {
            // Not a UUID, try as username, then as email
            var repo = com.example.tasksmanage.repository.UserRepositoryHolder.get();
            return repo.findByUsername(principalName)
                .or(() -> repo.findByEmail(principalName))
                .map(com.example.tasksmanage.model.User::getId)
                .orElseThrow(() -> new RuntimeException("User not found: " + principalName));
        }
    }

    @PostMapping("/revoke/{id}")
    public ResponseEntity<Void> revoke(@PathVariable UUID id) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No authenticated user found");
        }
        UUID userId = resolveUserId(authentication.getName());
        apiKeyService.revokeApiKey(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<ApiKey>> list() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No authenticated user found");
        }
        UUID userId = resolveUserId(authentication.getName());
        return ResponseEntity.ok(apiKeyService.listApiKeys(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No authenticated user found");
        }
        UUID userId = resolveUserId(authentication.getName());
        // Soft delete by revoking the key for this user
        apiKeyService.revokeApiKey(id, userId);
        return ResponseEntity.noContent().build();
    }
}
