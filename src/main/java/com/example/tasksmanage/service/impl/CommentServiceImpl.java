package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.Comment;
import com.example.tasksmanage.model.Task;
import com.example.tasksmanage.repository.CommentRepository;
import com.example.tasksmanage.repository.TaskRepository;
import com.example.tasksmanage.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentServiceImpl implements CommentService {
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public Comment createComment(UUID taskId, Comment comment, UUID parentCommentId) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        comment.setTask(task);
        if (parentCommentId != null) {
            Comment parent = commentRepository.findById(parentCommentId).orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parent);
        }
        // Mentions parsing
        parseMentions(comment.getContent());
        // TODO: Notify mentioned users if needed
        Comment saved = commentRepository.save(comment);
        // Broadcast over STOMP
        publishEvent(taskId, Map.of(
                "type", "new",
                "comment", toDto(saved)
        ));
        return saved;
    }

    @Override
    public List<Comment> getCommentsByTask(UUID taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    @Override
    @Transactional
    public Comment updateComment(UUID commentId, String content) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setContent(content);
        // Mentions parsing
        parseMentions(content);
        // TODO: Notify mentioned users if needed
        Comment saved = commentRepository.save(comment);
        // Broadcast over STOMP
        UUID taskId = saved.getTask() != null ? saved.getTask().getId() : null;
        if (taskId != null) {
            publishEvent(taskId, Map.of(
                    "type", "update",
                    "comment", toDto(saved)
            ));
        }
        return saved;
    }

    @Override
    @Transactional
    public void deleteComment(UUID commentId) {
        // Fetch first to get taskId for broadcasting
        Comment existing = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        UUID taskId = existing.getTask() != null ? existing.getTask().getId() : null;
        commentRepository.deleteById(commentId);
        if (taskId != null) {
            publishEvent(taskId, Map.of(
                    "type", "delete",
                    "id", commentId.toString()
            ));
        }
    }

    @Override
    public Comment getComment(UUID commentId) {
        return commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
    }

    private Set<String> parseMentions(String content) {
        Set<String> usernames = new HashSet<>();
        Pattern pattern = Pattern.compile("@([A-Za-z0-9_]+)");
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            usernames.add(matcher.group(1));
        }
        return usernames;
    }

    private void publishEvent(UUID taskId, Map<String, Object> payload) {
        if (messagingTemplate != null && taskId != null) {
            messagingTemplate.convertAndSend("/topic/comments/" + taskId, payload);
        }
    }

    private Map<String, Object> toDto(Comment c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("content", c.getContent());
        m.put("createdAt", null);
        m.put("updatedAt", null);
        m.put("parentCommentId", c.getParentComment() != null ? c.getParentComment().getId() : null);
        Map<String, Object> author = new HashMap<>();
        if (c.getAuthor() != null) {
            author.put("id", c.getAuthor().getId());
            author.put("username", c.getAuthor().getUsername());
            author.put("firstName", c.getAuthor().getFirstName());
            author.put("lastName", c.getAuthor().getLastName());
        }
        m.put("author", author.isEmpty() ? null : author);
        return m;
    }
}
