package com.example.tasksmanage.service;

public interface OAuth2Service {
    String getAuthorizationUrl(String provider);
    void handleCallback(String provider, String code);
}
