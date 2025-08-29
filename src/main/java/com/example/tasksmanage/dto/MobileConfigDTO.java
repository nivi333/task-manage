package com.example.tasksmanage.dto;

public class MobileConfigDTO {
    public boolean enableOffline = true;
    public boolean enablePush = false; // set true when VAPID is configured
    public String vapidPublicKey; // Web Push VAPID public key (Base64 URL-safe)
    public String minAppVersion = "1.0.0";
}
