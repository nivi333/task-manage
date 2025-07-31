package com.example.tasksmanage.dto;

import jakarta.validation.constraints.NotBlank;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Login request", example = "{\"usernameOrEmail\": \"user@email.com\", \"password\": \"string\"}")
public class AuthRequest {
    @NotBlank
    private String usernameOrEmail;
    @NotBlank
    private String password;

    // Getters and setters
    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
