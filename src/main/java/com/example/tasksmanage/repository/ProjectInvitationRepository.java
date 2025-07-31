package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.ProjectInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProjectInvitationRepository extends JpaRepository<ProjectInvitation, UUID> {
    Optional<ProjectInvitation> findByToken(String token);
}
