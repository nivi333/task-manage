package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.EmailIntegrationService;
import org.springframework.stereotype.Service;

@Service
public class EmailIntegrationServiceImpl implements EmailIntegrationService {
    @Override
    public void sendEmail(String to, String subject, String body) {
        // TODO: Integrate with Email API
        System.out.println("[Stub] Sending email to: " + to + ", subject: " + subject + ", body: " + body);
    }
}
