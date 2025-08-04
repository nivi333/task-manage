package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.Task;
import com.example.tasksmanage.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class TaskControllerTest {
    @Mock
    private TaskService taskService;

    @InjectMocks
    private TaskController taskController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

/*
void testGetTaskById() {
    // UUID id = UUID.randomUUID();
    // Task mockTask = new Task();
    // mockTask.setId(id);
    // when(taskService.getTaskById(id)).thenReturn(mockTask);
    // ResponseEntity<Task> response = taskController.getTaskById(id);
    // assertEquals(200, response.getStatusCodeValue());
    // assertEquals(id, response.getBody().getId());
}
*/
}
