package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.TaskDependency;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TaskDependencyRepository extends JpaRepository<TaskDependency, UUID> {
}
