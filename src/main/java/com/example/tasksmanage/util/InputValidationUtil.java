package com.example.tasksmanage.util;

public class InputValidationUtil {
    public static boolean isValidString(String input, int minLength, int maxLength) {
        return input != null && input.length() >= minLength && input.length() <= maxLength;
    }
    public static boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
    public static boolean isValidUUID(String uuid) {
        return uuid != null && uuid.matches("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
    }
    public static boolean isSafeSqlString(String input) {
        return input != null && !input.matches(".*([';--]).*");
    }
    public static String sanitize(String input) {
        if (input == null) return null;
        return input.replaceAll("[<>]", "");
    }
}
