package com.example.tasksmanage.performance;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@SpringBootTest
@AutoConfigureMockMvc
public class TaskPerformanceTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void testListTasksPerformance() throws Exception {
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/tasks"));
        long duration = System.currentTimeMillis() - start;
        // Example: assert that listing tasks takes less than 1s (1000ms)
        assert(duration < 1000);
    }
}
