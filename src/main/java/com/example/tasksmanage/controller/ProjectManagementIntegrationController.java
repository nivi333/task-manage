package com.example.tasksmanage.controller;

import com.example.tasksmanage.service.ProjectManagementIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/integrations/project-management")
public class ProjectManagementIntegrationController {
    @Autowired
    private ProjectManagementIntegrationService projectManagementIntegrationService;

    @PostMapping("/sync-issue")
    public ResponseEntity<String> syncIssue(@RequestParam String tool, @RequestParam String issueId) {
        projectManagementIntegrationService.syncIssue(tool, issueId);
        return ResponseEntity.ok("Issue synced from " + tool + ": " + issueId);
    }
}
