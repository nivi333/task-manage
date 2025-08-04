package com.example.tasksmanage.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "search_analytics")
public class SearchAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String query;

    @Column(nullable = false)
    private Date timestamp = new Date();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
