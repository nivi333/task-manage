package com.example.tasksmanage.service;

import com.example.tasksmanage.dto.ProjectCreateDTO;
import com.example.tasksmanage.dto.ProjectDTO;
import com.example.tasksmanage.model.Project;
import com.example.tasksmanage.model.ProjectStatus;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.repository.ProjectRepository;
import com.example.tasksmanage.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;

    public ProjectDTO toDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setOwnerId(project.getOwner() != null ? project.getOwner().getId() : null);
        dto.setTeamMemberIds(project.getTeamMembers().stream().map(User::getId).collect(Collectors.toSet()));
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }

    @Transactional
    public ProjectDTO createProject(ProjectCreateDTO dto) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStatus(dto.getStatus() != null ? dto.getStatus() : ProjectStatus.ACTIVE);
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        if (dto.getOwnerId() != null) {
            userRepository.findById(dto.getOwnerId()).ifPresent(project::setOwner);
        }
        if (dto.getTeamMemberIds() != null) {
            Set<User> members = new HashSet<>();
            for (UUID uid : dto.getTeamMemberIds()) {
                userRepository.findById(uid).ifPresent(members::add);
            }
            project.setTeamMembers(members);
        }
        project.setCreatedAt(new Date());
        project.setUpdatedAt(new Date());
        projectRepository.save(project);
        return toDTO(project);
    }

    public ProjectDTO getProject(UUID id) {
        return projectRepository.findById(id).map(this::toDTO)
            .orElseThrow(() -> new NoSuchElementException("Project not found"));
    }

    @Transactional
    public ProjectDTO updateProject(UUID id, ProjectCreateDTO dto) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Project not found"));
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStatus(dto.getStatus());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        if (dto.getOwnerId() != null) {
            userRepository.findById(dto.getOwnerId()).ifPresent(project::setOwner);
        }
        if (dto.getTeamMemberIds() != null) {
            Set<User> members = new HashSet<>();
            for (UUID uid : dto.getTeamMemberIds()) {
                userRepository.findById(uid).ifPresent(members::add);
            }
            project.setTeamMembers(members);
        }
        project.setUpdatedAt(new Date());
        projectRepository.save(project);
        return toDTO(project);
    }

    @Transactional
    public void deleteProject(UUID id) {
        projectRepository.deleteById(id);
    }

    public List<ProjectDTO> listProjects() {
        return projectRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO updateStatus(UUID id, ProjectStatus status) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Project not found"));
        project.setStatus(status);
        project.setUpdatedAt(new Date());
        projectRepository.save(project);
        return toDTO(project);
    }
}
