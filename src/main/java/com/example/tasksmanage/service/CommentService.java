package com.example.tasksmanage.service;

import com.example.tasksmanage.model.Comment;
import java.util.List;
import java.util.UUID;

public interface CommentService {
    Comment createComment(UUID taskId, Comment comment, UUID parentCommentId);
    List<Comment> getCommentsByTask(UUID taskId);
    Comment updateComment(UUID commentId, String content);
    void deleteComment(UUID commentId);
    Comment getComment(UUID commentId);
}
