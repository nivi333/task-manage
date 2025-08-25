package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.Task;
import com.example.tasksmanage.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tags")
public class TagsController {

    @Autowired
    private TaskRepository taskRepository;

    public static class TagSummary {
        public String name;
        public long count;
        public TagSummary(String name, long count) { this.name = name; this.count = count; }
    }

    public static class RenameRequest { public String name; }
    public static class MergeRequest { public String from; public String to; }

    @GetMapping
    public ResponseEntity<List<TagSummary>> list() {
        List<Task> tasks = taskRepository.findAll();
        Map<String, Long> freq = new HashMap<>();
        for (Task t : tasks) {
            if (t.getTags() == null) continue;
            for (String tag : t.getTags()) {
                if (tag == null) continue;
                String key = normalize(tag);
                if (key.isEmpty()) continue;
                freq.put(key, freq.getOrDefault(key, 0L) + 1);
            }
        }
        List<TagSummary> out = freq.entrySet().stream()
                .map(e -> new TagSummary(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong((TagSummary ts) -> ts.count)
                        .reversed()
                        .thenComparing(ts -> ts.name))
                .collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    @PatchMapping("/{oldName}/rename")
    @Transactional
    public ResponseEntity<Map<String, Object>> rename(@PathVariable("oldName") String oldName,
                                                      @RequestBody RenameRequest body) {
        String target = normalize(body != null ? body.name : null);
        String old = normalize(oldName);
        if (old.isEmpty() || target.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid tag names"));
        }
        List<Task> tasks = taskRepository.findAll();
        int changed = 0;
        for (Task t : tasks) {
            Set<String> tags = t.getTags();
            if (tags == null || tags.isEmpty()) continue;
            boolean modified = false;
            Set<String> updated = new HashSet<>();
            for (String tag : tags) {
                String n = normalize(tag);
                if (n.equals(old)) {
                    updated.add(target);
                    modified = true;
                } else {
                    updated.add(n);
                }
            }
            if (modified) {
                t.setTags(updated);
                changed++;
            }
        }
        if (changed > 0) taskRepository.saveAll(tasks);
        return ResponseEntity.ok(Map.of("message", "Tags renamed", "updatedTasks", changed));
    }

    @PostMapping("/merge")
    @Transactional
    public ResponseEntity<Map<String, Object>> merge(@RequestBody MergeRequest body) {
        String from = normalize(body != null ? body.from : null);
        String to = normalize(body != null ? body.to : null);
        if (from.isEmpty() || to.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid merge parameters"));
        }
        List<Task> tasks = taskRepository.findAll();
        int changed = 0;
        for (Task t : tasks) {
            Set<String> tags = t.getTags();
            if (tags == null || tags.isEmpty()) continue;
            if (tags.stream().map(this::normalize).anyMatch(from::equals)) {
                Set<String> updated = tags.stream().map(this::normalize).collect(Collectors.toSet());
                updated.remove(from);
                updated.add(to);
                t.setTags(updated);
                changed++;
            }
        }
        if (changed > 0) taskRepository.saveAll(tasks);
        return ResponseEntity.ok(Map.of("message", "Tags merged", "updatedTasks", changed));
    }

    @DeleteMapping("/{name}")
    @Transactional
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("name") String name) {
        String target = normalize(name);
        if (target.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid tag name"));
        }
        List<Task> tasks = taskRepository.findAll();
        int changed = 0;
        for (Task t : tasks) {
            Set<String> tags = t.getTags();
            if (tags == null || tags.isEmpty()) continue;
            Set<String> updated = tags.stream().map(this::normalize).collect(Collectors.toSet());
            if (updated.remove(target)) {
                t.setTags(updated);
                changed++;
            }
        }
        if (changed > 0) taskRepository.saveAll(tasks);
        return ResponseEntity.ok(Map.of("message", "Tag deleted", "updatedTasks", changed));
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().replaceAll("\\s+", " ").toLowerCase();
    }
}
