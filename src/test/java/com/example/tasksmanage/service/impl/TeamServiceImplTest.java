package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.Team;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.repository.TeamRepository;
import com.example.tasksmanage.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class TeamServiceImplTest {
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private TeamServiceImpl teamService;

    private Team team;
    private User user;
    private UUID teamId;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        teamId = UUID.randomUUID();
        team = new Team();
        team.setId(teamId);
        team.setName("Test Team");
        user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        team.setUsers(new HashSet<>());
    }

    @Test
    void addUserAndGetTeamMembers_returnsUserList() {
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(teamRepository.save(any(Team.class))).thenAnswer(i -> i.getArgument(0));

        // Add user to team
        teamService.addMember(teamId, user, null);
        // Now the team should have the user
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        List<User> users = teamService.getTeamMembers(teamId);
        assertEquals(1, users.size());
        assertEquals("testuser", users.get(0).getUsername());
    }
}
