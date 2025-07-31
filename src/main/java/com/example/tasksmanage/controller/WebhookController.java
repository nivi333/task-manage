package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.Webhook;
import com.example.tasksmanage.repository.WebhookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/webhooks")
public class WebhookController {

    @Autowired
    private WebhookRepository webhookRepository;

    @GetMapping
    public ResponseEntity<List<Webhook>> listWebhooks() {
        return ResponseEntity.ok(webhookRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Webhook> createWebhook(@RequestBody Webhook webhook) {
        webhook.setId(null);
        webhook.setActive(true);
        Webhook created = webhookRepository.save(webhook);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWebhook(@PathVariable UUID id) {
        Webhook existing = webhookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Webhook not found"));
        webhookRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
