package com.settlekar.backend.service;

import com.settlekar.backend.dto.request.ChangePasswordRequest;
import com.settlekar.backend.dto.request.SetPasswordRequest;
import com.settlekar.backend.dto.request.UpdateProfileRequest;
import com.settlekar.backend.dto.response.MessageResponse;
import com.settlekar.backend.dto.response.UserResponse;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.AuthProvider;
import com.settlekar.backend.exception.BadRequestException;
import com.settlekar.backend.exception.DuplicateUsernameException;
import com.settlekar.backend.exception.ResourceNotFoundException;
import com.settlekar.backend.repository.UserRepository;
import com.settlekar.backend.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    /**
     * Get user by ID
     */
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.USER_NOT_FOUND));
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.USER_NOT_FOUND));
    }

    /**
     * Get current user profile
     */
    public UserResponse getCurrentUserProfile(UUID userId) {
        User user = getUserById(userId);
        return mapToUserResponse(user);
    }

    /**
     * Update user profile
     */
    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = getUserById(userId);

        // Update fields if provided
        if (request.getUsername() != null) {
            if (userRepository.existsByUsername(request.getUsername()) &&
                    !request.getUsername().equals(user.getDisplayUsername())) {
                throw new DuplicateUsernameException(Constants.USERNAME_ALREADY_EXISTS);
            }
            user.setUsername(request.getUsername());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        User updatedUser = userRepository.save(user);
        log.info("Profile updated for user: {}", user.getEmail());

        return mapToUserResponse(updatedUser);
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = getUserById(userId);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException(Constants.PASSWORD_MISMATCH);
        }

        // Validate new password is different
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getEmail());
    }

    /**
     * Set password for Google users (enable manual login)
     * Only allows Google users without existing password to set one
     */
    @Transactional
    public MessageResponse setPassword(UUID userId, SetPasswordRequest request) {
        User user = getUserById(userId);

        // Only allow for Google users without password
        if (user.getAuthProvider() != AuthProvider.GOOGLE) {
            throw new BadRequestException("This feature is only for Google-authenticated users");
        }

        if (user.getPasswordHash() != null) {
            throw new BadRequestException("Password already set. Use change password instead.");
        }

        // Set password (no need to check confirmPassword - frontend handles that)
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        log.info("Password set for Google user: {}", user.getEmail());

        return MessageResponse.success("Password set successfully. You can now login with email and password.");
    }

    /**
     * Check if email exists
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public Page<UserResponse> searchUsers(String query, Pageable pageable) {
        return userRepository.findByUsernameContainingIgnoreCase(query, pageable)
                .map(this::mapToUserResponse);
    }

    public boolean checkUsernameAvailability(String username) {
        return !userRepository.existsByUsername(username);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getDisplayUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .dob(user.getDob())
                .phone(user.getPhone())
                .gender(user.getGender())
                .authProvider(user.getAuthProvider())
                .isVerified(user.getIsVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}