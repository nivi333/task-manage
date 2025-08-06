package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.EmailService;

import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {
    @Override
    public void sendEmail(String to, String subject, String body) {
        // TODO: Integrate with Email API
        System.out.println("[Stub] Sending email to: " + to + ", subject: " + subject + ", body: " + body);
    }

    @Override
    public void sendVerificationEmail(String to, String subject, String template, java.util.Map<String,Object> params) {
        // TODO: Implement verification email sending
    }
}
