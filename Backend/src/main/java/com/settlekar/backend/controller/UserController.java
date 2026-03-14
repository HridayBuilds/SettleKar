package com.settlekar.backend.controller;

import com.settlekar.backend.dto.request.ChangePasswordRequest;
import com.settlekar.backend.dto.request.SetPasswordRequest;
import com.settlekar.backend.dto.request.UpdateProfileRequest;
import com.settlekar.backend.dto.response.MessageResponse;
import com.settlekar.backend.dto.response.UserResponse;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * Get current user profile
     * GET /api/users/me
     * Requires: JWT token in Authorization header
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        log.info("Get profile request for user: {}", currentUser.getEmail());
        UserResponse response = userService.getCurrentUserProfile(currentUser.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Update current user profile
     * PUT /api/users/update-profile
     * Requires: JWT token in Authorization header
     */
    @PutMapping("/update-profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {

        log.info("Update profile request for user: {}", currentUser.getEmail());
        UserResponse response = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Change password for current user
     * POST /api/users/change-password
     * Requires: JWT token in Authorization header
     */
    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {

        log.info("Change password request for user: {}", currentUser.getEmail());
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }

    @PostMapping("/set-password")
    public ResponseEntity<MessageResponse> setPassword(@AuthenticationPrincipal User currentUser,
                                                       @Valid @RequestBody SetPasswordRequest request) {

        log.info("Set password request for Google user: {}", currentUser.getEmail());
        MessageResponse response = userService.setPassword(currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<UserResponse> results = userService.searchUsers(q, PageRequest.of(page, size));
        return ResponseEntity.ok(results);
    }

    @GetMapping("/check-username")
    public ResponseEntity<MessageResponse> checkUsername(@RequestParam String username) {
        boolean available = userService.checkUsernameAvailability(username);
        return ResponseEntity.ok(new MessageResponse(
                available ? "Username is available" : "Username is already taken",
                available
        ));
    }

}
