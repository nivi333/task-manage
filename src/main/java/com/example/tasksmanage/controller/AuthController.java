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
    private final com.example.tasksmanage.service.TwoFactorAuthService twoFactorAuthService;

    @Autowired
    public AuthController(UserService userService, com.example.tasksmanage.service.TwoFactorAuthService twoFactorAuthService) {
        this.userService = userService;
        this.twoFactorAuthService = twoFactorAuthService;
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

    // 2FA Setup Endpoint
    @PostMapping("/2fa/setup")
    public ResponseEntity<ApiResponse<com.example.tasksmanage.dto.TwoFactorSetupResponse>> setup2fa(@RequestParam String usernameOrEmail) {
        var userOpt = userService.findByUsernameOrEmail(usernameOrEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "User not found", null));
        }
        var user = userOpt.get();
        String secret = twoFactorAuthService.generateSecret();
        user.setTotpSecret(secret);
        user.set2faEnabled(false);
        user.setBackupCodes(twoFactorAuthService.generateBackupCodes());
        userService.save(user);
        String qrCodeUrl = twoFactorAuthService.getQrCodeUrl(user.getEmail(), secret);
        return ResponseEntity.ok(new ApiResponse<>(true, "2FA setup initiated", new com.example.tasksmanage.dto.TwoFactorSetupResponse(qrCodeUrl, secret)));
    }

    // 2FA Verify Endpoint
    @PostMapping("/2fa/verify")
    public ResponseEntity<ApiResponse<String>> verify2fa(@RequestParam String usernameOrEmail, @RequestBody com.example.tasksmanage.dto.TwoFactorVerifyRequest req) {
        var userOpt = userService.findByUsernameOrEmail(usernameOrEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "User not found", null));
        }
        var user = userOpt.get();
        boolean valid = twoFactorAuthService.verifyTotpCode(user.getTotpSecret(), Integer.parseInt(req.getCode()));
        if (valid) {
            user.set2faEnabled(true);
            userService.save(user);
            return ResponseEntity.ok(new ApiResponse<>(true, "2FA enabled successfully", null));
        } else {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid 2FA code", null));
        }
    }

    // 2FA Backup Codes Endpoint
    @PostMapping("/2fa/backup")
    public ResponseEntity<ApiResponse<com.example.tasksmanage.dto.TwoFactorBackupCodesResponse>> regenBackupCodes(@RequestParam String usernameOrEmail) {
        var userOpt = userService.findByUsernameOrEmail(usernameOrEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "User not found", null));
        }
        var user = userOpt.get();
        var codes = twoFactorAuthService.generateBackupCodes();
        user.setBackupCodes(codes);
        userService.save(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Backup codes regenerated", new com.example.tasksmanage.dto.TwoFactorBackupCodesResponse(codes)));
    }

    // 2FA Recovery Endpoint (stub)
    @PostMapping("/2fa/recovery")
    public ResponseEntity<ApiResponse<String>> recover2fa(@RequestBody com.example.tasksmanage.dto.TwoFactorRecoveryRequest req) {
        // TODO: Implement admin/email recovery flow
        return ResponseEntity.ok(new ApiResponse<>(true, "2FA recovery process initiated (stub)", null));
    }
}



