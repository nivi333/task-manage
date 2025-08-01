package com.example.tasksmanage.controller;

import com.example.tasksmanage.service.EmailIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/integrations/email")
public class EmailIntegrationController {
    @Autowired
    private EmailIntegrationService emailIntegrationService;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestParam String to, @RequestParam String subject, @RequestParam String body) {
        emailIntegrationService.sendEmail(to, subject, body);
        return ResponseEntity.ok("Email sent");
    }

    // OAuth2 endpoints will be added here
}
