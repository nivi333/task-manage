package com.example.tasksmanage.dto;

import java.util.Set;

public class TwoFactorBackupCodesResponse {
    private Set<String> backupCodes;

    public TwoFactorBackupCodesResponse(Set<String> backupCodes) {
        this.backupCodes = backupCodes;
    }

    public Set<String> getBackupCodes() {
        return backupCodes;
    }

    public void setBackupCodes(Set<String> backupCodes) {
        this.backupCodes = backupCodes;
    }
}
