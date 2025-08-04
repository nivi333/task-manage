package com.example.tasksmanage.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Date;
import java.util.UUID;

public class ProjectTest {
    @Test
    void testProjectGettersAndSetters() {
        Project project = new Project();
        UUID id = UUID.randomUUID();
        project.setId(id);
        project.setName("Test Project");
        project.setDescription("Test Description");
        project.setStatus(ProjectStatus.ACTIVE);
        Date start = new Date();
        project.setStartDate(start);
        assertEquals(id, project.getId());
        assertEquals("Test Project", project.getName());
        assertEquals("Test Description", project.getDescription());
        assertEquals(ProjectStatus.ACTIVE, project.getStatus());
        assertEquals(start, project.getStartDate());
    }
}
