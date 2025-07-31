package com.example.tasksmanage.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Password reset request", example = "{\"email\":\"user@email.com\"}")
public class PasswordResetRequest {
    @Email
    @NotBlank
    private String email;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
