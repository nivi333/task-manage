package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.CalendarIntegrationService;
import org.springframework.stereotype.Service;

@Service
public class CalendarIntegrationServiceImpl implements CalendarIntegrationService {
    @Override
    public void createEvent(String title, String startTime, String endTime) {
        // TODO: Integrate with Calendar API
        System.out.println("[Stub] Creating calendar event: " + title + ", start: " + startTime + ", end: " + endTime);
    }
}
