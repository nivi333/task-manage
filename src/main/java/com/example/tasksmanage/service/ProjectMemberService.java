package com.example.tasksmanage.service;

import com.example.tasksmanage.dto.ProjectMemberAddRequest;
import com.example.tasksmanage.dto.ProjectMemberDTO;
import com.example.tasksmanage.model.*;
import com.example.tasksmanage.repository.ProjectMemberRepository;
import com.example.tasksmanage.repository.ProjectRepository;
import com.example.tasksmanage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectMemberService {
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;

    public ProjectMemberDTO toDTO(ProjectMember member) {
        ProjectMemberDTO dto = new ProjectMemberDTO();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setProjectId(member.getProject().getId());
        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        dto.setLastActivityAt(member.getLastActivityAt());
        return dto;
    }

    public List<ProjectMemberDTO> listMembers(UUID projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new NoSuchElementException("Project not found"));
        return projectMemberRepository.findByProject(project).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<ProjectMemberDTO> addMembers(UUID projectId, ProjectMemberAddRequest req) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new NoSuchElementException("Project not found"));
        List<ProjectMemberDTO> added = new ArrayList<>();
        for (UUID userId : req.getUserIds()) {
            User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found: " + userId));
            if (projectMemberRepository.findByProjectAndUser(project, user).isEmpty()) {
                ProjectMember member = new ProjectMember();
                member.setProject(project);
                member.setUser(user);
                member.setRole(req.getRole() != null ? req.getRole() : ProjectMemberRole.MEMBER);
                member.setJoinedAt(new Date());
                member.setLastActivityAt(new Date());
                projectMemberRepository.save(member);
                // TODO: Audit log entry
                added.add(toDTO(member));
            }
        }
        return added;
    }

    @Transactional
    public void removeMember(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new NoSuchElementException("Project not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found"));
        projectMemberRepository.deleteByProjectAndUser(project, user);
        // TODO: Audit log entry
    }

    @Transactional
    public ProjectMemberDTO updateRole(UUID projectId, UUID userId, ProjectMemberRole role) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new NoSuchElementException("Project not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found"));
        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, user).orElseThrow(() -> new NoSuchElementException("Membership not found"));
        member.setRole(role);
        member.setLastActivityAt(new Date());
        projectMemberRepository.save(member);
        // TODO: Audit log entry
        return toDTO(member);
    }
}
