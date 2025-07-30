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

    @GetMapping("/profile")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> updateProfile(@AuthenticationPrincipal User user, @Valid @RequestBody com.example.tasksmanage.dto.UserProfileUpdateDTO req) {
        return ResponseEntity.ok(userService.updateProfile(user, req));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> uploadAvatar(@AuthenticationPrincipal User user, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(userService.uploadAvatar(user, file));
    }

    // ADMIN: List users with pagination and filtering
    @GetMapping("")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.data.domain.Page<com.example.tasksmanage.dto.UserProfileDTO>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(userService.listUsers(page, size, search));
    }

    // ADMIN: Delete user by id
    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> deleteUser(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }
}
