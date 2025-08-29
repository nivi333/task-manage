package com.example.tasksmanage.dto;

import jakarta.validation.constraints.NotBlank;

public class PushSubscriptionDTO {
    @NotBlank
    public String endpoint;

    public static class Keys {
        @NotBlank
        public String p256dh;
        @NotBlank
        public String auth;
    }

    public Keys keys;

    public String userAgent;
    public String platform; // e.g., web, ios, android
}
