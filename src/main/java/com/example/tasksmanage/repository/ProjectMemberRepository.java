package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.ProjectMember;
import com.example.tasksmanage.model.Project;
import com.example.tasksmanage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {
    List<ProjectMember> findByProject(Project project);
    List<ProjectMember> findByUser(User user);
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
    void deleteByProjectAndUser(Project project, User user);
}
