package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.ApiResponse;
import com.example.tasksmanage.dto.ChangePasswordDTO;
import jakarta.servlet.http.HttpServletResponse;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    @Autowired
    private UserService userService;

    // Resolve authenticated user from SecurityContext (JWT filter sets principal name)
    private User getAuthenticatedUserOrNull() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        String principalName = auth.getName(); // username (set by JwtAuthenticationFilter)
        return userService.findByUsernameOrEmail(principalName).orElse(null);
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@AuthenticationPrincipal User user, @Valid @RequestBody ChangePasswordDTO req) {
        User current = (user != null) ? user : getAuthenticatedUserOrNull();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Unauthorized", null));
        }
        String msg = userService.changePassword(current, req.getOldPassword(), req.getNewPassword());
        return ResponseEntity.ok(new ApiResponse<>(true, msg, null));
    }

    @GetMapping("/profile")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> getProfile(@AuthenticationPrincipal User user) {
        User current = (user != null) ? user : getAuthenticatedUserOrNull();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(userService.getProfile(current));
    }

    @PutMapping("/profile")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> updateProfile(@AuthenticationPrincipal User user, @Valid @RequestBody com.example.tasksmanage.dto.UserProfileUpdateDTO req) {
        User current = (user != null) ? user : getAuthenticatedUserOrNull();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(userService.updateProfile(current, req));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> uploadAvatar(@AuthenticationPrincipal User user, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        User current = (user != null) ? user : getAuthenticatedUserOrNull();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(userService.uploadAvatar(current, file));
    }

    // ADMIN: List users with pagination and filtering
    @GetMapping("")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.data.domain.Page<com.example.tasksmanage.dto.UserProfileDTO>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(userService.listUsers(page, size, search));
    }

    // ADMIN: Create user
    @PostMapping("")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> createUser(
            @Valid @RequestBody com.example.tasksmanage.dto.AdminCreateUserRequest req,
            @AuthenticationPrincipal User actor) {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        com.example.tasksmanage.dto.UserProfileDTO created = userService.adminCreateUser(req, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ADMIN: Suspend user
    @PostMapping("/{id}/suspend")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> suspendUser(@PathVariable java.util.UUID id, @AuthenticationPrincipal User actor) {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        return ResponseEntity.ok(userService.suspendUser(id, current));
    }

    // ADMIN: Activate user
    @PostMapping("/{id}/activate")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> activateUser(@PathVariable java.util.UUID id, @AuthenticationPrincipal User actor) {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        return ResponseEntity.ok(userService.activateUser(id, current));
    }

    // ADMIN: Restore user
    @PostMapping("/{id}/restore")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> restoreUser(@PathVariable java.util.UUID id, @AuthenticationPrincipal User actor) {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        return ResponseEntity.ok(userService.restoreUser(id, current));
    }

    // ADMIN: Bulk suspend
    @PostMapping("/bulk/suspend")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> bulkSuspend(@RequestBody java.util.List<java.util.UUID> ids, @AuthenticationPrincipal User actor) {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        userService.suspendUsers(ids, current);
        return ResponseEntity.ok(new ApiResponse<>(true, "Users suspended", null));
    }
    // ADMIN: Bulk activate
    @PostMapping("/bulk/activate")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> bulkActivate(@RequestBody java.util.List<java.util.UUID> ids, @AuthenticationPrincipal User actor) {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        userService.activateUsers(ids, current);
        return ResponseEntity.ok(new ApiResponse<>(true, "Users activated", null));
    }
    // ADMIN: Bulk delete
    @PostMapping("/bulk/delete")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> bulkDelete(@RequestBody java.util.List<java.util.UUID> ids, @AuthenticationPrincipal User actor) {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        userService.deleteUsers(ids, current);
        return ResponseEntity.ok(new ApiResponse<>(true, "Users deleted", null));
    }

    // ADMIN: Export users as CSV
    @GetMapping("/export/csv")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public void exportUsersCsv(HttpServletResponse response) throws java.io.IOException {
        var users = userService.exportUsers();
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=users.csv");
        java.io.PrintWriter writer = response.getWriter();
        writer.write("id,email,username,firstName,lastName,status,roles,createdAt,lastLogin\n");
        for (var u : users) {
            writer.write(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                u.getId(), u.getEmail(), u.getUsername(), u.getFirstName(), u.getLastName(),
                u.getStatus(), u.getRoles(), u.getCreatedAt(), u.getLastLogin()));
        }
        writer.flush();
    }

    // ADMIN: Export users as JSON
    @GetMapping("/export/json")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public java.util.List<com.example.tasksmanage.dto.UserExportDTO> exportUsersJson() {
        return userService.exportUsers();
    }

    // ADMIN: User statistics dashboard
    @GetMapping("/stats")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public java.util.Map<String, Object> userStats() {
        return userService.getUserStats();
    }

    // ADMIN: Delete user by id
    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> deleteUser(@PathVariable java.util.UUID id, @AuthenticationPrincipal User actor) {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        return ResponseEntity.ok(userService.deleteUser(id, current));
    }
}
