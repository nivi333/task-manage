package com.example.tasksmanage.service;

public interface SSOService {
    String getSamlRequestUrl();
    void handleSamlResponse(String samlResponse);
    String getOAuth2AuthorizationUrl(String provider);
    void handleOAuth2Callback(String provider, String code);
}
