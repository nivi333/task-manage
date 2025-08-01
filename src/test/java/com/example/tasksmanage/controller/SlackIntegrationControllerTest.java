package com.example.tasksmanage.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import com.example.tasksmanage.service.SlackIntegrationService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.tasksmanage.controller.SlackIntegrationController;
import com.example.tasksmanage.service.SlackIntegrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SlackIntegrationControllerTest {
    private MockMvc mockMvc;

    @Mock
    private SlackIntegrationService slackIntegrationService;

    @InjectMocks
    private SlackIntegrationController slackIntegrationController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(slackIntegrationController).build();
    }

    @Test
    void sendMessage_shouldReturnOk() throws Exception {
        doNothing().when(slackIntegrationService).sendMessage(anyString(), anyString());

        mockMvc.perform(post("/api/v1/integrations/slack/send-message")
                .param("channel", "test-channel")
                .param("message", "Hello!"))
                .andExpect(status().isOk());

        verify(slackIntegrationService).sendMessage("test-channel", "Hello!");
    }
}

