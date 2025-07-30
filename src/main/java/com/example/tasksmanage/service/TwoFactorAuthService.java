package com.example.tasksmanage.service;

import com.example.tasksmanage.model.User;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Random;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import java.util.Set;

@Service
public class TwoFactorAuthService {
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();
    private static final int BACKUP_CODE_COUNT = 5;
    private static final int BACKUP_CODE_LENGTH = 8;

    // Generate a new TOTP secret for a user
    public String generateSecret() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    // Generate QR code URL for Google Authenticator
    public String getQrCodeUrl(String userEmail, String secret) {
        // Use the overload that accepts a GoogleAuthenticatorKey for compatibility
        com.warrenstrange.googleauth.GoogleAuthenticatorKey key = new com.warrenstrange.googleauth.GoogleAuthenticatorKey.Builder(secret).build();
        return GoogleAuthenticatorQRGenerator.getOtpAuthURL("TasksManageApp", userEmail, key);
    }

    // Validate a TOTP code
    public boolean verifyTotpCode(String secret, int code) {
        return gAuth.authorize(secret, code);
    }

    // Generate backup codes
    public Set<String> generateBackupCodes() {
        Set<String> codes = new HashSet<>();
        Random rnd = new Random();
        while (codes.size() < BACKUP_CODE_COUNT) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < BACKUP_CODE_LENGTH; i++) {
                sb.append((char) ('A' + rnd.nextInt(26)));
            }
            codes.add(sb.toString());
        }
        return codes;
    }

    // Validate and consume a backup code
    public boolean useBackupCode(User user, String code) {
        Set<String> codes = user.getBackupCodes();
        if (codes.contains(code)) {
            codes.remove(code);
            user.setBackupCodes(codes);
            return true;
        }
        return false;
    }
}
