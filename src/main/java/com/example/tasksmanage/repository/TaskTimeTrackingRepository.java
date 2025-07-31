package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.TaskTimeTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TaskTimeTrackingRepository extends JpaRepository<TaskTimeTracking, UUID> {
}
