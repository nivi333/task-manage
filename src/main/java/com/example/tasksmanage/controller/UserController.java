package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.ApiResponse;
import com.example.tasksmanage.dto.ChangePasswordDTO;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@AuthenticationPrincipal User user, @Valid @RequestBody ChangePasswordDTO req) {
        String msg = userService.changePassword(user, req.getOldPassword(), req.getNewPassword());
        return ResponseEntity.ok(new ApiResponse<>(true, msg, null));
    }
}
