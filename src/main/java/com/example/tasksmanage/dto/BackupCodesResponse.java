package com.example.tasksmanage.dto;

import java.util.Set;

public class BackupCodesResponse {
    private Set<String> backupCodes;

    public BackupCodesResponse(Set<String> backupCodes) {
        this.backupCodes = backupCodes;
    }

    public Set<String> getBackupCodes() {
        return backupCodes;
    }

    public void setBackupCodes(Set<String> backupCodes) {
        this.backupCodes = backupCodes;
    }
}
