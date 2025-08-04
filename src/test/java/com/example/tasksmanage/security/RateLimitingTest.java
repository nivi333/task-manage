package com.example.tasksmanage.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(com.example.tasksmanage.TestSecurityConfig.class)
public class RateLimitingTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void testRateLimiting() throws Exception {
        for (int i = 0; i < 65; i++) {
            mockMvc.perform(get("/api/tasks"))
                    .andExpect(i < 60 ? status().isOk() : status().isTooManyRequests());
        }
    }
}
