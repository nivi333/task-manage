package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.CloudStorageService;
import org.springframework.stereotype.Service;

@Service
public class CloudStorageServiceImpl implements CloudStorageService {
    @Override
    public void uploadFile(String provider, String fileId) {
        // TODO: Integrate with cloud storage APIs (Google Drive, Dropbox)
        System.out.println("[Stub] Uploading file " + fileId + " to " + provider);
    }
}
