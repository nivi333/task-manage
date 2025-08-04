package com.example.tasksmanage.controller;

import com.example.tasksmanage.repository.WebhookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(com.example.tasksmanage.TestSecurityConfig.class)
public class WebhookControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private WebhookRepository webhookRepository;

    @BeforeEach
    void setUp() {
        webhookRepository.deleteAll();
    }

    @Test
    void testCreateAndDeleteWebhook() throws Exception {
        String json = "{\"callbackUrl\":\"http://example.com/webhook\",\"secret\":\"s3cr3t\",\"subscribedEvents\":[\"TASK_CREATED\"]}";
        mockMvc.perform(post("/api/webhooks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/webhooks"))
                .andExpect(status().isOk());
    }
}
