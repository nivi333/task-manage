package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.TaskTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, UUID> {
}
