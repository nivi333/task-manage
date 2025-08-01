package com.example.tasksmanage.service;

public interface SlackIntegrationService {
    void sendMessage(String channel, String message);
}
