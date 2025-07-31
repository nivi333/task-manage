package com.example.tasksmanage.service;

import com.example.tasksmanage.dto.ProjectInvitationDTO;
import com.example.tasksmanage.dto.ProjectInvitationRequest;
import com.example.tasksmanage.dto.ProjectMemberDTO;
import com.example.tasksmanage.model.*;
import com.example.tasksmanage.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class ProjectInvitationService {
    @Autowired
    private ProjectInvitationRepository invitationRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectMemberService memberService;
    @Autowired
    private ProjectAuditLogRepository auditLogRepository;
    @Autowired
    private EmailService emailService; // Assuming EmailService is defined elsewhere

    private ProjectInvitationDTO toDTO(ProjectInvitation inv) {
        ProjectInvitationDTO dto = new ProjectInvitationDTO();
        dto.setId(inv.getId());
        dto.setProjectId(inv.getProject().getId());
        dto.setEmail(inv.getEmail());
        dto.setToken(inv.getToken());
        dto.setCreatedAt(inv.getCreatedAt());
        dto.setExpiresAt(inv.getExpiresAt());
        dto.setAccepted(inv.isAccepted());
        return dto;
    }

    @Transactional
    public ProjectInvitationDTO sendInvitation(UUID projectId, ProjectInvitationRequest req, UUID actingUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found"));
        ProjectInvitation inv = new ProjectInvitation();
        inv.setProject(project);
        inv.setEmail(req.getEmail());
        String token = UUID.randomUUID().toString();
        inv.setToken(token);
        inv.setCreatedAt(new Date());
        inv.setExpiresAt(new Date(System.currentTimeMillis() + req.getExpiresInHours() * 3600L * 1000L));
        inv.setAccepted(false);
        invitationRepository.save(inv);
        // Audit log
        ProjectAuditLog log = new ProjectAuditLog();
        log.setProject(project);
        log.setPerformedBy(actingUserId);
        log.setAction(ProjectAuditAction.INVITATION_SENT);
        log.setDetails("Invitation sent to " + req.getEmail());
        auditLogRepository.save(log);
        // Send email with invitation token (implement EmailService accordingly)
        // TODO: Implement invitation email sending logic here. EmailService does not have sendInvitation method.
        // emailService.sendInvitation(inv.getEmail(), inv.getToken(), project.getId());
        return toDTO(inv);
    }

    @Transactional
    public ProjectMemberDTO acceptInvitation(UUID projectId, String token, UUID userId) {
        ProjectInvitation inv = invitationRepository.findByToken(token)
                .orElseThrow(() -> new NoSuchElementException("Invalid invitation token"));
        if (!inv.getProject().getId().equals(projectId)) {
            throw new SecurityException("Invitation does not belong to this project");
        }
        if (inv.isAccepted()) {
            throw new IllegalStateException("Invitation already accepted");
        }
        if (inv.getExpiresAt().before(new Date())) {
            throw new IllegalStateException("Invitation expired");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        // Prevent duplicate member addition
        boolean alreadyMember = memberService.listMembers(projectId).stream()
                .anyMatch(m -> m.getUserId().equals(userId));
        ProjectMemberDTO memberDto;
        if (alreadyMember) {
            // User is already a member; return existing member info
            memberDto = memberService.listMembers(projectId).stream()
                    .filter(m -> m.getUserId().equals(userId)).findFirst().get();
        } else {
            com.example.tasksmanage.dto.ProjectMemberAddRequest addReq = new com.example.tasksmanage.dto.ProjectMemberAddRequest();
            addReq.setUserIds(java.util.Set.of(userId));
            addReq.setRole(ProjectMemberRole.MEMBER);
            // Note: possible race condition if two acceptances happen simultaneously
            memberDto = memberService.addMembers(projectId, addReq).get(0);
        }
        // Mark invitation accepted
        inv.setAccepted(true);
        invitationRepository.save(inv);
        // Audit log
        ProjectAuditLog log = new ProjectAuditLog();
        log.setProject(inv.getProject());
        log.setPerformedBy(userId);
        log.setAction(ProjectAuditAction.INVITATION_ACCEPTED);
        log.setDetails("Invitation accepted by user " + userId);
        auditLogRepository.save(log);
        return memberDto;
    }
}
