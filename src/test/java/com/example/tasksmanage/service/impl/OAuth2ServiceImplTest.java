package com.example.tasksmanage.service.impl;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OAuth2ServiceImplTest {
    @Test
    void testGetAuthorizationUrl() {
        OAuth2ServiceImpl service = new OAuth2ServiceImpl();
        String url = service.getAuthorizationUrl("google");
        assertNotNull(url);
        assertTrue(url.contains("google"));
    }

    @Test
    void testHandleCallback() {
        OAuth2ServiceImpl service = new OAuth2ServiceImpl();
        assertDoesNotThrow(() -> service.handleCallback("google", "dummy-code"));
    }
}
