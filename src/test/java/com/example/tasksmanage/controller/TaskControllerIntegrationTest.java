package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.Project;
import com.example.tasksmanage.model.ProjectStatus;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.repository.ProjectRepository;
import com.example.tasksmanage.repository.TaskRepository;
import com.example.tasksmanage.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(com.example.tasksmanage.TestSecurityConfig.class)
public class TaskControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testCreateAndGetTask() throws Exception {
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("testuser@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setPassword("password");
        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());
        user = userRepository.save(user);

        Project project = new Project();
        project.setName("Integration Test Project");
        project.setOwner(user);
                project.setStatus(ProjectStatus.ACTIVE);
        project.setCreatedAt(new Date());
        project.setUpdatedAt(new Date());
        project = projectRepository.save(project);

        String json = String.format("{\"title\":\"Integration Task\",\"description\":\"Test description\",\"status\":\"OPEN\",\"priority\":\"HIGH\",\"assignedTo\":\"%s\",\"projectId\":\"%s\"}", user.getId(), project.getId());
        mockMvc.perform(post("/api/v1/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/v1/tasks"))
                .andExpect(status().isOk());
    }
}
