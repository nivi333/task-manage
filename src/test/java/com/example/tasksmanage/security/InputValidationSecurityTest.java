package com.example.tasksmanage.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import com.example.tasksmanage.controller.TaskController;
import com.example.tasksmanage.service.TaskService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class InputValidationSecurityTest {

    @Mock
    private TaskService taskService;
    
    private MockMvc mockMvc;
    
    @BeforeEach
    void setUp() {
        TaskController taskController = new TaskController();
        // Use reflection to inject the mock service
        try {
            java.lang.reflect.Field field = TaskController.class.getDeclaredField("taskService");
            field.setAccessible(true);
            field.set(taskController, taskService);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        
        mockMvc = MockMvcBuilders.standaloneSetup(taskController)
                .build();
    }

    @Test
    public void testSqlInjectionInput() throws Exception {
        mockMvc.perform(post("/api/v1/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"'; DROP TABLE tasks; --\", \"description\":\"Test\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testXssInput() throws Exception {
        mockMvc.perform(post("/api/v1/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"<script>alert('xss')</script>\", \"description\":\"Test\"}"))
                .andExpect(status().isBadRequest());
    }
}
