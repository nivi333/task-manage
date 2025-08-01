package com.example.tasksmanage.service.impl;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailIntegrationServiceImplTest {
    @Test
    void testSendEmail() {
        EmailIntegrationServiceImpl service = new EmailIntegrationServiceImpl();
        assertDoesNotThrow(() -> service.sendEmail("test@example.com", "Subject", "Body"));
    }
}
