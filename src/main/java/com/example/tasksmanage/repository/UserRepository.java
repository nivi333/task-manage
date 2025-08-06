package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    org.springframework.data.domain.Page<User> findUsersBySearchTerm(@org.springframework.data.repository.query.Param("searchTerm") String searchTerm, org.springframework.data.domain.Pageable pageable);

    long countByStatus(com.example.tasksmanage.model.AccountStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE u.lastLogin >= :since")
    long countRecentLogins(java.time.Instant since);

    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
