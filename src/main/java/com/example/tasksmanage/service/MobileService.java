package com.example.tasksmanage.service;

import com.example.tasksmanage.dto.MobileConfigDTO;
import com.example.tasksmanage.dto.PushSubscriptionDTO;
import com.example.tasksmanage.model.User;

public interface MobileService {
    MobileConfigDTO getConfig();
    void savePushToken(User user, PushSubscriptionDTO dto);
}
