package com.example.tasksmanage.service;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
void sendVerificationEmail(String to, String subject, String template, java.util.Map<String,Object> params);
}
