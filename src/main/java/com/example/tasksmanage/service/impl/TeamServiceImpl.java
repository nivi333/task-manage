package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.Team;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.repository.TeamRepository;
import com.example.tasksmanage.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TeamServiceImpl implements TeamService {
    @Autowired
    private TeamRepository teamRepository;

    @Override
    public Team createTeam(Team team) {
        return teamRepository.save(team);
    }

    @Override
    public Team updateTeam(UUID teamId, Team team) {
        Optional<Team> existing = teamRepository.findById(teamId);
        if (existing.isPresent()) {
            Team t = existing.get();
            t.setName(team.getName());
            t.setDescription(team.getDescription());
            t.setParentTeam(team.getParentTeam());
            return teamRepository.save(t);
        }
        throw new RuntimeException("Team not found");
    }

    @Override
    public void deleteTeam(UUID teamId) {
        teamRepository.deleteById(teamId);
    }

    @Override
    public Team getTeam(UUID teamId) {
        return teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
    }

    @Override
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @Override
    public Team addMember(UUID teamId, User user, String role) {
        Team team = getTeam(teamId);
        team.getMembers().add(user);
        return teamRepository.save(team);
    }

    @Override
    public Team removeMember(UUID teamId, UUID userId) {
        Team team = getTeam(teamId);
        team.getMembers().removeIf(u -> u.getId().equals(userId));
        return teamRepository.save(team);
    }

    @Override
    public List<User> getTeamMembers(UUID teamId) {
        return List.copyOf(getTeam(teamId).getMembers());
    }
}
