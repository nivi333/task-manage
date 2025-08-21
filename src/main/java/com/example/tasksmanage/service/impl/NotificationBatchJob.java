package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.Notification;
import com.example.tasksmanage.model.NotificationPreferences;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.repository.NotificationRepository;
import com.example.tasksmanage.repository.NotificationPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NotificationBatchJob {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private NotificationPreferencesRepository preferencesRepository;
    @Autowired(required = false)
    private JavaMailSender mailSender;

    // Run every hour
    @Scheduled(cron = "0 0 * * * *")
    public void sendBatchNotifications() {
        // Find users with batch notifications enabled
        List<NotificationPreferences> batchUsers = preferencesRepository.findByBatchEnabled(true);
        for (NotificationPreferences prefs : batchUsers) {
            User user = prefs.getUser();
            List<Notification> unread = notificationRepository.findByUser_Id(user.getId()).stream()
                    .filter(n -> !n.isRead() && !n.isBatched())
                    .collect(Collectors.toList());
            if (!unread.isEmpty() && mailSender != null && user.getEmail() != null) {
                StringBuilder body = new StringBuilder("You have new notifications:\n\n");
                for (Notification n : unread) {
                    body.append("- ").append(n.getContent()).append("\n");
                    n.setBatched(true);
                }
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(user.getEmail());
                message.setSubject("Task Manager: Notification Digest");
                message.setText(body.toString());
                mailSender.send(message);
                notificationRepository.saveAll(unread);
            }
        }
    }
}
