package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.Notification;
import com.example.tasksmanage.repository.NotificationRepository;
import com.example.tasksmanage.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public Notification createNotification(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        // Real-time WebSocket notification
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/notifications/" + notification.getUser().getId(), saved);
        }
        // Email notification
        if (mailSender != null && notification.getUser().getEmail() != null) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(notification.getUser().getEmail());
            message.setSubject("New Notification");
            message.setText(notification.getContent());
            mailSender.send(message);
        }
        return saved;
    }

    @Override
    public List<Notification> getNotificationsByUser(UUID userId) {
        return notificationRepository.findByUser_Id(userId);
    }

    @Override
    public Notification markAsRead(UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId).orElseThrow();
        n.setRead(true);
        return notificationRepository.save(n);
    }

    @Override
    public Notification markAsUnread(UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId).orElseThrow();
        n.setRead(false);
        return notificationRepository.save(n);
    }

    @Override
    public List<Notification> getArchivedNotifications(UUID userId) {
        return notificationRepository.findByUser_IdAndArchived(userId, true);
    }

    @Override
    public List<Notification> getAllNotifications(UUID userId) {
        return notificationRepository.findByUser_Id(userId);
    }

    @Override
    public Notification archiveNotification(UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId).orElseThrow();
        n.setArchived(true);
        n.setArchivedAt(java.time.LocalDateTime.now());
        return notificationRepository.save(n);
    }

    @Override
    public Notification unarchiveNotification(UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId).orElseThrow();
        n.setArchived(false);
        n.setArchivedAt(null);
        return notificationRepository.save(n);
    }

    @Override
    public void deleteNotification(UUID notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}
