package com.example.tasksmanage.service;

import com.example.tasksmanage.dto.UserRegistrationRequest;
import com.example.tasksmanage.model.AccountStatus;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.model.EmailVerificationToken;
import com.example.tasksmanage.repository.UserRepository;
import com.example.tasksmanage.repository.EmailVerificationTokenRepository;
import com.example.tasksmanage.repository.RefreshTokenRepository;
import com.example.tasksmanage.model.RefreshToken;
import com.example.tasksmanage.service.EmailService;
import com.example.tasksmanage.util.JwtUtil;
import com.example.tasksmanage.model.PasswordResetToken;
import com.example.tasksmanage.repository.PasswordResetTokenRepository;
import com.example.tasksmanage.model.PasswordHistory;
import com.example.tasksmanage.repository.PasswordHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import jakarta.mail.MessagingException;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;

    @Autowired
    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, EmailVerificationTokenRepository tokenRepository, EmailService emailService, JwtUtil jwtUtil, RefreshTokenRepository refreshTokenRepository, PasswordResetTokenRepository passwordResetTokenRepository, PasswordHistoryRepository passwordHistoryRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordHistoryRepository = passwordHistoryRepository;
    }

    @Transactional
    public User registerUser(UserRegistrationRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username already in use");
        }
        User user = new User();
        user.setEmail(req.getEmail());
        user.setUsername(req.getUsername());
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole("USER");
        user.setStatus(AccountStatus.ACTIVE);
        user.setCreatedAt(new java.util.Date());
        user.setUpdatedAt(new java.util.Date());
        User savedUser = userRepository.save(user);

        // Create verification token (24h expiry)
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(savedUser);
        verificationToken.setExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
        tokenRepository.save(verificationToken);

        // Send verification email
        String verificationUrl = "http://localhost:8080/api/v1/auth/verify-email?token=" + token;
        Map<String, Object> variables = new HashMap<>();
        variables.put("firstName", savedUser.getFirstName());
        variables.put("verificationUrl", verificationUrl);
        try {
            emailService.sendVerificationEmail(savedUser.getEmail(), "Verify your email address", "email-verification.html", variables);
        } catch (MessagingException e) {
            // Optionally handle email failure (log, retry, etc.)
            throw new RuntimeException("Failed to send verification email", e);
        }
        return savedUser;
    }

    public Map<String, String> authenticateAndGenerateTokens(String usernameOrEmail, String password) {
        User user = userRepository.findByEmail(usernameOrEmail)
                .or(() -> userRepository.findByUsername(usernameOrEmail))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username/email or password"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid username/email or password");
        }
        // Optionally: check if email is verified
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("role", user.getRole());
        String jwt = jwtUtil.generateToken(user.getUsername(), claims);
        String refreshTokenValue = UUID.randomUUID().toString();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", jwt);
        tokens.put("refreshToken", refreshTokenValue);
        return tokens;
    }

    public Map<String, String> refreshJwtToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        if (refreshToken.isRevoked() || refreshToken.getExpiryDate().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Expired or revoked refresh token");
        }
        User user = refreshToken.getUser();
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("role", user.getRole());
        String jwt = jwtUtil.generateToken(user.getUsername(), claims);
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", jwt);
        tokens.put("refreshToken", refreshTokenValue);
        return tokens;
    }

    public void revokeRefreshToken(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No user with that email"));
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(Instant.now().plus(1, ChronoUnit.HOURS));
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);
        Map<String, Object> variables = new HashMap<>();
        variables.put("firstName", user.getFirstName());
        variables.put("resetUrl", "http://localhost:8080/api/v1/auth/reset-password?token=" + token);
        try {
            emailService.sendVerificationEmail(user.getEmail(), "Reset your password", "password-reset.html", variables);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Transactional
    public String resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
        if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(Instant.now())) {
            return "Reset token expired or already used.";
        }
        User user = resetToken.getUser();
        // Prevent reuse: check last 5 passwords
        List<PasswordHistory> last5 = passwordHistoryRepository.findTop5ByUserOrderByChangedAtDesc(user);
        for (PasswordHistory ph : last5) {
            if (passwordEncoder.matches(newPassword, ph.getPasswordHash())) {
                return "You cannot reuse a recent password.";
            }
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(new java.util.Date());
        userRepository.save(user);
        // Save to password history
        PasswordHistory ph = new PasswordHistory();
        ph.setUser(user);
        ph.setPasswordHash(user.getPassword());
        ph.setChangedAt(new java.util.Date());
        passwordHistoryRepository.save(ph);
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        return "Password reset successful.";
    }

    @Transactional
    public String changePassword(User user, String oldPassword, String newPassword) {
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return "Old password is incorrect.";
        }
        // Prevent reuse: check last 5 passwords
        List<PasswordHistory> last5 = passwordHistoryRepository.findTop5ByUserOrderByChangedAtDesc(user);
        for (PasswordHistory ph : last5) {
            if (passwordEncoder.matches(newPassword, ph.getPasswordHash())) {
                return "You cannot reuse a recent password.";
            }
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(new java.util.Date());
        userRepository.save(user);
        PasswordHistory ph = new PasswordHistory();
        ph.setUser(user);
        ph.setPasswordHash(user.getPassword());
        ph.setChangedAt(new java.util.Date());
        passwordHistoryRepository.save(ph);
        return "Password changed successfully.";
    }

    // Account lockout logic (stub):
    // Track failed login attempts, lock user after N tries, unlock after time or admin intervention.
    // This can be implemented via a field in User and event listeners in Spring Security.

    @Transactional
    public String verifyEmailToken(String token) {
        var optionalToken = tokenRepository.findByToken(token);
        if (optionalToken.isEmpty()) {
            return "Invalid or expired verification token.";
        }
        var verificationToken = optionalToken.get();
        if (verificationToken.isUsed()) {
            return "This verification token has already been used.";
        }
        if (verificationToken.getExpiryDate().isBefore(java.time.Instant.now())) {
            return "Verification token has expired. Please request a new verification email.";
        }
        // Mark user as verified (optionally add a field to User if needed)
        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);
        return "Email verified successfully. You can now log in.";
    }
}

