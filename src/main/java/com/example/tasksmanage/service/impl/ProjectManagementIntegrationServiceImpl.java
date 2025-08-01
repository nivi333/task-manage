package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.ProjectManagementIntegrationService;
import org.springframework.stereotype.Service;

@Service
public class ProjectManagementIntegrationServiceImpl implements ProjectManagementIntegrationService {
    @Override
    public void syncIssue(String tool, String issueId) {
        // TODO: Integrate with project management APIs
        System.out.println("[Stub] Syncing issue " + issueId + " from tool: " + tool);
    }
}
