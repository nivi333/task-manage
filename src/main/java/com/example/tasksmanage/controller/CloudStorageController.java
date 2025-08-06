package com.example.tasksmanage.controller;

import com.example.tasksmanage.service.CloudStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/integrations/cloud-storage")
public class CloudStorageController {
    @Autowired
    private CloudStorageService cloudStorageService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam String provider, @RequestParam String fileId) {
        cloudStorageService.uploadFile(provider, fileId);
        return ResponseEntity.ok("File " + fileId + " uploaded to " + provider);
    }
}
