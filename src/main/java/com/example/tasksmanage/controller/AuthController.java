package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.ApiResponse;
import com.example.tasksmanage.dto.UserRegistrationRequest;
import com.example.tasksmanage.dto.AuthRequest;
import com.example.tasksmanage.dto.AuthResponse;
import com.example.tasksmanage.dto.PasswordResetRequest;
import com.example.tasksmanage.dto.ResetPasswordDTO;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody UserRegistrationRequest request) {
        User user = userService.registerUser(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Registration successful. Please check your email to verify your account.", user));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam("token") String token) {
        String message = userService.verifyEmailToken(token);
        return ResponseEntity.ok(new ApiResponse<>(true, message, null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        // TODO: Account lockout logic (stub)
        Map<String, String> tokens = userService.authenticateAndGenerateTokens(request.getUsernameOrEmail(), request.getPassword());
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", new AuthResponse(tokens.get("accessToken"), tokens.get("refreshToken"))));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        userService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset email sent", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordDTO req) {
        String msg = userService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok(new ApiResponse<>(true, msg, null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestParam("refreshToken") String refreshToken) {
        Map<String, String> tokens = userService.refreshJwtToken(refreshToken);
        return ResponseEntity.ok(new ApiResponse<>(true, "Token refreshed", new AuthResponse(tokens.get("accessToken"), tokens.get("refreshToken"))));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@RequestParam("refreshToken") String refreshToken) {
        userService.revokeRefreshToken(refreshToken);
        return ResponseEntity.ok(new ApiResponse<>(true, "Logged out successfully", null));
    }
}


