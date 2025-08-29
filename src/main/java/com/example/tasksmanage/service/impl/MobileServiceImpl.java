package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.dto.MobileConfigDTO;
import com.example.tasksmanage.dto.PushSubscriptionDTO;
import com.example.tasksmanage.model.PushSubscription;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.repository.PushSubscriptionRepository;
import com.example.tasksmanage.service.MobileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class MobileServiceImpl implements MobileService {

    private final PushSubscriptionRepository repo;

    @Value("${app.pwa.enableOffline:true}")
    private boolean enableOffline;

    @Value("${app.pwa.enablePush:false}")
    private boolean enablePush;

    @Value("${app.pwa.vapidPublicKey:}")
    private String vapidPublicKey;

    @Value("${app.pwa.minAppVersion:1.0.0}")
    private String minAppVersion;

    public MobileServiceImpl(PushSubscriptionRepository repo) {
        this.repo = repo;
    }

    @Override
    public MobileConfigDTO getConfig() {
        MobileConfigDTO dto = new MobileConfigDTO();
        dto.enableOffline = enableOffline;
        dto.enablePush = enablePush && StringUtils.hasText(vapidPublicKey);
        dto.vapidPublicKey = StringUtils.hasText(vapidPublicKey) ? vapidPublicKey : null;
        dto.minAppVersion = minAppVersion;
        return dto;
    }

    @Override
    public void savePushToken(User user, PushSubscriptionDTO dto) {
        if (user == null) throw new IllegalArgumentException("User required");
        if (!StringUtils.hasText(dto.endpoint) || dto.keys == null ||
                !StringUtils.hasText(dto.keys.auth) || !StringUtils.hasText(dto.keys.p256dh)) {
            throw new IllegalArgumentException("Invalid push subscription payload");
        }
        PushSubscription entity = repo.findByUserIdAndEndpoint(user.getId(), dto.endpoint)
                .orElseGet(PushSubscription::new);
        entity.setUserId(user.getId());
        entity.setEndpoint(dto.endpoint);
        entity.setP256dh(dto.keys.p256dh);
        entity.setAuth(dto.keys.auth);
        entity.setUserAgent(dto.userAgent);
        entity.setPlatform(dto.platform);
        repo.save(entity);
    }
}
