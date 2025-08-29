package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.MobileConfigDTO;
import com.example.tasksmanage.dto.PushSubscriptionDTO;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.service.MobileService;
import com.example.tasksmanage.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mobile")
public class MobileController {

    @Autowired
    private MobileService mobileService;

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

    @GetMapping("/config")
    public ResponseEntity<MobileConfigDTO> getConfig() {
        return ResponseEntity.ok(mobileService.getConfig());
    }

    @PostMapping("/push-token")
    public ResponseEntity<Void> savePushToken(@AuthenticationPrincipal User user,
                                              @Valid @RequestBody PushSubscriptionDTO req) {
        User current = (user != null) ? user : getAuthenticatedUserOrNull();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            mobileService.savePushToken(current, req);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}
