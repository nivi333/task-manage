package com.example.tasksmanage.service;

import com.example.tasksmanage.model.Team;
import com.example.tasksmanage.model.User;
import java.util.List;
import java.util.UUID;

public interface TeamService {
    Team createTeam(Team team);
    Team updateTeam(UUID teamId, Team team);
    void deleteTeam(UUID teamId);
    Team getTeam(UUID teamId);
    List<Team> getAllTeams();
    Team addMember(UUID teamId, User user, String role);
    Team addMemberById(UUID teamId, UUID userId, String role);
    Team removeMember(UUID teamId, UUID userId);
    List<User> getTeamMembers(UUID teamId);
    // Add more methods for hierarchy, permissions, activity feed as needed
}
