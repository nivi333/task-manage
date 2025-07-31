package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.Comment;
import com.example.tasksmanage.model.Task;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.repository.CommentRepository;
import com.example.tasksmanage.repository.TaskRepository;
import com.example.tasksmanage.repository.UserRepository;
import com.example.tasksmanage.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
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
    @Autowired
    private UserRepository userRepository;

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
        Set<String> mentionedUsernames = parseMentions(comment.getContent());
        // TODO: Notify mentioned users if needed
        return commentRepository.save(comment);
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
        Set<String> mentionedUsernames = parseMentions(content);
        // TODO: Notify mentioned users if needed
        return commentRepository.save(comment);
    }

    @Override
    @Transactional
    public void deleteComment(UUID commentId) {
        commentRepository.deleteById(commentId);
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
}
