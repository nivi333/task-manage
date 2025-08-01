package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.OAuth2Service;
import org.springframework.stereotype.Service;

@Service
public class OAuth2ServiceImpl implements OAuth2Service {
    @Override
    public String getAuthorizationUrl(String provider) {
        // TODO: Build provider-specific authorization URL
        return "https://example.com/oauth2/authorize?provider=" + provider;
    }

    @Override
    public void handleCallback(String provider, String code) {
        // TODO: Exchange code for token and persist
        System.out.println("[Stub] Handling OAuth2 callback for provider: " + provider + ", code: " + code);
    }
}
