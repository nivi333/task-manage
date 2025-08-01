package com.example.tasksmanage.service;

public interface EmailIntegrationService {
    void sendEmail(String to, String subject, String body);
}
