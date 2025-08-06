package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.ApiKey;
import com.example.tasksmanage.repository.ApiKeyRepository;
import com.example.tasksmanage.service.ApiKeyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ApiKeyServiceImpl implements ApiKeyService {
    private final ApiKeyRepository apiKeyRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    public ApiKeyServiceImpl(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Override
    public ApiKey generateApiKey(UUID userId, String name) {
        String key = generateRandomKey();
        ApiKey apiKey = new ApiKey();
        apiKey.setApiKey(key);
        apiKey.setName(name);
        apiKey.setUserId(userId);
        apiKey.setActive(true);
        apiKey.setCreatedAt(java.time.Instant.now());
        return apiKeyRepository.save(apiKey);
    }

    @Override
    public void revokeApiKey(UUID apiKeyId, UUID userId) {
        Optional<ApiKey> apiKeyOpt = apiKeyRepository.findById(apiKeyId);
        apiKeyOpt.ifPresent(apiKey -> {
            if (apiKey.getUserId().equals(userId)) {
                apiKey.setActive(false);
                apiKeyRepository.save(apiKey);
            }
        });
    }

    @Override
    public List<ApiKey> listApiKeys(UUID userId) {
        return apiKeyRepository.findByUserId(userId);
    }

    @Override
    public ApiKey validateApiKey(String key) {
        return apiKeyRepository.findByApiKey(key)
                .filter(ApiKey::isActive)
                .orElse(null);
    }

    private String generateRandomKey() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
