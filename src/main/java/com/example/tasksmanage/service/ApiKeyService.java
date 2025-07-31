package com.example.tasksmanage.service;

import com.example.tasksmanage.model.ApiKey;
import java.util.List;
import java.util.UUID;

public interface ApiKeyService {
    ApiKey generateApiKey(UUID userId, String name);
    void revokeApiKey(UUID apiKeyId, UUID userId);
    List<ApiKey> listApiKeys(UUID userId);
    ApiKey validateApiKey(String key);
}
