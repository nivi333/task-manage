package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.admin.AdminStatsDTO;
import com.example.tasksmanage.model.SystemConfig;
import com.example.tasksmanage.model.UserAuditLog;
import com.example.tasksmanage.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    @Autowired private AdminService adminService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserAuditLog>> getAuditLogs(@RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(adminService.getAuditLogs(page, Math.min(size, 200)));
    }

    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfig> getConfig(@RequestParam(defaultValue = "global") String key) {
        SystemConfig cfg = adminService.getConfig(key);
        if (cfg == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(cfg);
    }

    @PutMapping(value = "/config", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfig> updateConfig(@RequestParam(defaultValue = "global") String key,
                                                     @RequestBody Map<String, Object> json,
                                                     @RequestHeader(value = "X-Actor-Id", required = false) UUID actorId) {
        try {
            // serialize back to string for storage
            String jsonString = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(json);
            SystemConfig saved = adminService.updateConfig(key, jsonString, actorId);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
