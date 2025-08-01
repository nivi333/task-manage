package com.example.tasksmanage.service.impl;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalendarIntegrationServiceImplTest {
    @Test
    void testCreateEvent() {
        CalendarIntegrationServiceImpl service = new CalendarIntegrationServiceImpl();
        assertDoesNotThrow(() -> service.createEvent("Meeting", "2025-08-01T10:00", "2025-08-01T11:00"));
    }
}
