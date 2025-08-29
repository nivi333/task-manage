package com.example.tasksmanage.controller;

import com.example.tasksmanage.dto.ApiResponse;
import com.example.tasksmanage.dto.ChangePasswordDTO;
import jakarta.servlet.http.HttpServletResponse;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> uploadAvatar(
            @AuthenticationPrincipal User user, 
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "username", required = false) String username) throws java.io.IOException {
        User current = (user != null) ? user : getAuthenticatedUserOrNull();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(userService.uploadAvatar(current, file, firstName, lastName, email, username));
    }

    @DeleteMapping("/profile/avatar")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> removeAvatar(@AuthenticationPrincipal User user) {
        User current = (user != null) ? user : getAuthenticatedUserOrNull();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(userService.removeAvatar(current));
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

    // ADMIN: Create user with optional avatar (multipart)
    @PostMapping(value = "", consumes = {"multipart/form-data", "multipart/form-data;charset=UTF-8", "multipart/form-data; charset=UTF-8"})
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> createUserMultipart(
            @RequestPart("email") String email,
            @RequestPart("username") String username,
            @RequestPart("firstName") String firstName,
            @RequestPart("lastName") String lastName,
            @RequestPart("password") String password,
            @RequestPart("role") String role,
            @RequestPart("status") String status,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            @AuthenticationPrincipal User actor) throws java.io.IOException {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        com.example.tasksmanage.dto.AdminCreateUserRequest req = new com.example.tasksmanage.dto.AdminCreateUserRequest();
        req.setEmail(email);
        req.setUsername(username);
        req.setFirstName(firstName);
        req.setLastName(lastName);
        req.setPassword(password);
        req.setRole(role);
        req.setStatus(status);
        com.example.tasksmanage.dto.UserProfileDTO created = userService.adminCreateUser(req, current);
        if (avatar != null && !avatar.isEmpty()) {
            // Upload avatar for the newly created user
            var createdUser = userService.findByUsernameOrEmail(username).orElse(null);
            if (createdUser != null) {
                userService.uploadAvatar(createdUser, avatar);
                created = userService.getProfile(createdUser);
            }
        }
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

    // ADMIN: Update user by id
    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> updateUser(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody com.example.tasksmanage.dto.AdminUpdateUserRequest req,
            @AuthenticationPrincipal User actor) {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        return ResponseEntity.ok(userService.adminUpdateUser(id, req, current));
    }

    // ADMIN: Update user avatar (multipart tolerant)
    @PutMapping(value = "/{id}/avatar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> updateUserAvatar(
            @PathVariable java.util.UUID id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
            // Optional extras (ignored but allowed so clients can send alongside)
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "username", required = false) String username,
            @AuthenticationPrincipal User actor) throws java.io.IOException {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        MultipartFile chosen = file != null ? file : (avatar != null ? avatar : profileImage);
        if (chosen == null || chosen.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
        return ResponseEntity.ok(userService.adminUploadAvatar(id, chosen, current));
    }

    // Get users available for team assignment (authenticated users only)
    @GetMapping("/for-teams")
    public ResponseEntity<java.util.List<com.example.tasksmanage.dto.UserSummaryDTO>> getUsersForTeamAssignment() {
        return ResponseEntity.ok(userService.getUsersForTeamAssignment());
    }

    // ADMIN: Delete user by id
    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.example.tasksmanage.dto.UserProfileDTO> deleteUser(@PathVariable java.util.UUID id, @AuthenticationPrincipal User actor) {
        User current = (actor != null) ? actor : getAuthenticatedUserOrNull();
        return ResponseEntity.ok(userService.deleteUser(id, current));
    }

    // SELF: Delete own account
    @DeleteMapping("/profile")
    public ResponseEntity<ApiResponse<String>> selfDelete(@AuthenticationPrincipal User user) {
        User current = (user != null) ? user : getAuthenticatedUserOrNull();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Unauthorized", null));
        }
        userService.selfDelete(current);
        return ResponseEntity.ok(new ApiResponse<>(true, "Account deleted successfully", null));
    }
}
