package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.Comment;
import com.example.tasksmanage.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks/{taskId}/comments")
public class CommentController {
    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<Comment> createComment(@PathVariable UUID taskId, @RequestBody Comment comment, @RequestParam(required = false) UUID parentCommentId) {
        return ResponseEntity.ok(commentService.createComment(taskId, comment, parentCommentId));
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getCommentsByTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(commentService.getCommentsByTask(taskId));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(@PathVariable UUID commentId, @RequestBody String content) {
        return ResponseEntity.ok(commentService.updateComment(commentId, content));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
