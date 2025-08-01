package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.SlackIntegrationService;
import org.springframework.stereotype.Service;

@Service
public class SlackIntegrationServiceImpl implements SlackIntegrationService {
    @Override
    public void sendMessage(String channel, String message) {
        // TODO: Integrate with Slack API
        System.out.println("[Stub] Sending message to Slack channel: " + channel + ", message: " + message);
    }
}
