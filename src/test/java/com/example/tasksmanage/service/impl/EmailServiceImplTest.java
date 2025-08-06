package com.example.tasksmanage.service.impl;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailServiceImplTest {
    @Test
    void testSendEmail() {
        EmailServiceImpl service = new EmailServiceImpl();
        assertDoesNotThrow(() -> service.sendEmail("test@example.com", "Subject", "Body"));
    }
}
