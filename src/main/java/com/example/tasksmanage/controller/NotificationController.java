package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.Notification;
import com.example.tasksmanage.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotificationsByUser(@RequestParam UUID userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userId));
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.createNotification(notification));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/{id}/unread")
    public ResponseEntity<Notification> markAsUnread(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.markAsUnread(id));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Notification>> getNotificationHistory(@RequestParam UUID userId, @RequestParam(required = false) Boolean archived) {
        if (archived != null && archived) {
            return ResponseEntity.ok(notificationService.getArchivedNotifications(userId));
        } else {
            return ResponseEntity.ok(notificationService.getAllNotifications(userId));
        }
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<Notification> archiveNotification(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.archiveNotification(id));
    }

    @PutMapping("/{id}/unarchive")
    public ResponseEntity<Notification> unarchiveNotification(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.unarchiveNotification(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
