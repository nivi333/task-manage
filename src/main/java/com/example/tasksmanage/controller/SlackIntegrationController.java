package com.example.tasksmanage.controller;

import com.example.tasksmanage.service.SlackIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/integrations/slack")
public class SlackIntegrationController {
    @Autowired
    private SlackIntegrationService slackIntegrationService;

    @PostMapping("/send-message")
    public ResponseEntity<String> sendMessage(@RequestParam String channel, @RequestParam String message) {
        slackIntegrationService.sendMessage(channel, message);
        return ResponseEntity.ok("Message sent to Slack");
    }

    // OAuth2 endpoints will be added here
}
