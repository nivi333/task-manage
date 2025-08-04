package com.example.tasksmanage.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Date;
import java.util.UUID;

public class TaskTest {
    @Test
    void testTaskGettersAndSetters() {
        Task task = new Task();
        UUID id = UUID.randomUUID();
        task.setId(id);
        task.setTitle("Test Task");
        task.setDescription("Test Description");
        task.setStatus("OPEN");
        task.setPriority("HIGH");
        Date now = new Date();
        task.setDueDate(now);
        task.setEstimatedHours(2);
        task.setActualHours(1);
        assertEquals(id, task.getId());
        assertEquals("Test Task", task.getTitle());
        assertEquals("Test Description", task.getDescription());
        assertEquals("OPEN", task.getStatus());
        assertEquals("HIGH", task.getPriority());
        assertEquals(now, task.getDueDate());
        assertEquals(2, task.getEstimatedHours());
        assertEquals(1, task.getActualHours());
    }
}
