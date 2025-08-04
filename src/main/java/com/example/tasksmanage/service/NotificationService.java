package com.example.tasksmanage.service;

import com.example.tasksmanage.model.Notification;
import java.util.List;
import java.util.UUID;

public interface NotificationService {
    Notification createNotification(Notification notification);
    List<Notification> getNotificationsByUser(UUID userId);
    Notification markAsRead(UUID notificationId);
    Notification markAsUnread(UUID notificationId);

    // Notification history and management
    List<Notification> getArchivedNotifications(UUID userId);
    List<Notification> getAllNotifications(UUID userId);
    Notification archiveNotification(UUID notificationId);
    Notification unarchiveNotification(UUID notificationId);
    void deleteNotification(UUID notificationId);
}
