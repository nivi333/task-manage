package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.UserSettingsDTO;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.service.SettingsService;
import com.example.tasksmanage.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @Autowired
    private UserService userService;

    private User getAuthenticatedUserOrNull() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        String principalName = auth.getName();
        return userService.findByUsernameOrEmail(principalName).orElse(null);
    }

    @GetMapping("")
    public ResponseEntity<UserSettingsDTO> getSettings(@AuthenticationPrincipal User user) {
        User current = (user != null) ? user : getAuthenticatedUserOrNull();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(settingsService.getSettings(current));
    }

    @PutMapping("")
    public ResponseEntity<UserSettingsDTO> updateSettings(@AuthenticationPrincipal User user,
                                                          @RequestBody UserSettingsDTO req) {
        User current = (user != null) ? user : getAuthenticatedUserOrNull();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(settingsService.updateSettings(current, req));
    }
}
