package com.example.tasksmanage.dto;

import com.example.tasksmanage.validator.PasswordStrength;
import jakarta.validation.constraints.NotBlank;

public class ChangePasswordDTO {
    @NotBlank
    private String oldPassword;
    @PasswordStrength
    private String newPassword;

    public String getOldPassword() { return oldPassword; }
    public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
