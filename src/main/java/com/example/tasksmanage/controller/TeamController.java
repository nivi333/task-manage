package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.Team;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teams")
public class TeamController {
    @Autowired
    private TeamService teamService;

    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody Team team) {
        return ResponseEntity.ok(teamService.createTeam(team));
    }

    @GetMapping
    public ResponseEntity<List<Team>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeam(@PathVariable UUID id) {
        return ResponseEntity.ok(teamService.getTeam(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(@PathVariable UUID id, @RequestBody Team team) {
        return ResponseEntity.ok(teamService.updateTeam(id, team));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable UUID id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Team> addMember(@PathVariable UUID id, @RequestBody User user) {
        // Role support can be added later
        return ResponseEntity.ok(teamService.addMember(id, user, null));
    }

    @DeleteMapping("/{id}/members")
    public ResponseEntity<Team> removeMember(@PathVariable UUID id, @RequestParam UUID userId) {
        return ResponseEntity.ok(teamService.removeMember(id, userId));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<User>> getTeamMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(teamService.getTeamMembers(id));
    }
}
