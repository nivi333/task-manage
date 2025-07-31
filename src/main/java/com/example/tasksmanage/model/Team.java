package com.example.tasksmanage.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToMany(mappedBy = "teams")
    private Set<User> members = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "parent_team_id")
    private Team parentTeam;

    @OneToMany(mappedBy = "parentTeam")
    private Set<Team> childTeams = new HashSet<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<User> getMembers() {
        return members;
    }

    public void setMembers(Set<User> members) {
        this.members = members;
    }

    public Team getParentTeam() {
        return parentTeam;
    }

    public void setParentTeam(Team parentTeam) {
        this.parentTeam = parentTeam;
    }

    public Set<Team> getChildTeams() {
        return childTeams;
    }

    public void setChildTeams(Set<Team> childTeams) {
        this.childTeams = childTeams;
    }
}
