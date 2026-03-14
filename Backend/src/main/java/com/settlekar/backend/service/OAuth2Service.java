package com.settlekar.backend.service;

import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.AuthProvider;
import com.settlekar.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service {

    private final UserRepository userRepository;

    /**
     * Process OAuth2 user (create if new, update if existing)
     */
    @Transactional
    public User processOAuth2User(String email, String googleId, String firstName, String lastName) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // Update Google ID if not set
            if (user.getGoogleId() == null || !user.getGoogleId().equals(googleId)) {
                user.setGoogleId(googleId);
                log.info("Updated Google ID for existing user: {}", email);
            }

            // Update name if not set
            if (user.getFirstName() == null && firstName != null) {
                user.setFirstName(firstName);
            }
            if (user.getLastName() == null && lastName != null) {
                user.setLastName(lastName);
            }

            return userRepository.save(user);
        } else {
            // Create new Google user
            return createGoogleUser(email, googleId, firstName, lastName);
        }
    }

    /**
     * Create new Google OAuth2 user
     */
    private User createGoogleUser(String email, String googleId, String firstName, String lastName) {
        User newUser = User.builder()
                .email(email.toLowerCase())
                .googleId(googleId)
                .firstName(firstName)
                .lastName(lastName)
                .authProvider(AuthProvider.GOOGLE)
                .isVerified(true) // Google users are pre-verified
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("Created new Google user: {}", email);

        return savedUser;
    }

    /**
     * Check if user needs to complete profile
     */
    public boolean needsProfileCompletion(User user) {
        return user.getFirstName() == null ||
                user.getLastName() == null ||
                user.getDob() == null ||
                user.getPhone() == null;
    }
}