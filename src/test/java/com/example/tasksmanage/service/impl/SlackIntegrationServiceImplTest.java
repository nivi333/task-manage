package com.example.tasksmanage.service.impl;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SlackIntegrationServiceImplTest {
    @Test
    void testSendMessage() {
        SlackIntegrationServiceImpl service = new SlackIntegrationServiceImpl();
        assertDoesNotThrow(() -> service.sendMessage("test-channel", "Hello, world!"));
    }
}
