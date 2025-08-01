package com.example.tasksmanage.controller;

import com.example.tasksmanage.service.CloudStorageIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/integrations/cloud-storage")
public class CloudStorageIntegrationController {
    @Autowired
    private CloudStorageIntegrationService cloudStorageIntegrationService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam String provider, @RequestParam String fileId) {
        cloudStorageIntegrationService.uploadFile(provider, fileId);
        return ResponseEntity.ok("File " + fileId + " uploaded to " + provider);
    }
}
