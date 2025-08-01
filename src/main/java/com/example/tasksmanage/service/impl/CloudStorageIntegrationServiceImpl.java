package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.CloudStorageIntegrationService;
import org.springframework.stereotype.Service;

@Service
public class CloudStorageIntegrationServiceImpl implements CloudStorageIntegrationService {
    @Override
    public void uploadFile(String provider, String fileId) {
        // TODO: Integrate with cloud storage APIs (Google Drive, Dropbox)
        System.out.println("[Stub] Uploading file " + fileId + " to " + provider);
    }
}
