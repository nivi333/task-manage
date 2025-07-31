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
}
