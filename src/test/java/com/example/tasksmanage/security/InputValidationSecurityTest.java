package com.example.tasksmanage.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(com.example.tasksmanage.TestSecurityConfig.class)
public class InputValidationSecurityTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void testSqlInjectionInput() throws Exception {
        String malicious = "{\"title\":\"DROP TABLE users;\",\"status\":\"OPEN\",\"priority\":\"HIGH\"}";
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(malicious))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testXssInput() throws Exception {
        String xss = "{\"title\":\"<script>alert('xss')</script>\",\"status\":\"OPEN\",\"priority\":\"HIGH\"}";
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(xss))
                .andExpect(status().isBadRequest());
    }
}
