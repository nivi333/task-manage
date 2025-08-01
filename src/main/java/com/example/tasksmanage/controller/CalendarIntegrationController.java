package com.example.tasksmanage.controller;

import com.example.tasksmanage.service.CalendarIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/integrations/calendar")
public class CalendarIntegrationController {
    @Autowired
    private CalendarIntegrationService calendarIntegrationService;

    @PostMapping("/create-event")
    public ResponseEntity<String> createEvent(@RequestParam String title, @RequestParam String startTime, @RequestParam String endTime) {
        calendarIntegrationService.createEvent(title, startTime, endTime);
        return ResponseEntity.ok("Event created in calendar");
    }

    // OAuth2 endpoints will be added here
}
