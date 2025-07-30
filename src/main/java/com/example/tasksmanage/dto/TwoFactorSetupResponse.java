package com.example.tasksmanage.dto;

public class TwoFactorSetupResponse {
    private String qrCodeUrl;
    private String secret;

    public TwoFactorSetupResponse(String qrCodeUrl, String secret) {
        this.qrCodeUrl = qrCodeUrl;
        this.secret = secret;
    }

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }
}
