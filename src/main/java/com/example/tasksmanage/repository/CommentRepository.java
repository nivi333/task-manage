package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByTaskId(UUID taskId);
    List<Comment> findByParentCommentId(UUID parentCommentId);
}
