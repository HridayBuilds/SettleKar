package com.settlekar.backend.service;

import com.settlekar.backend.dto.request.ForgotPasswordRequest;
import com.settlekar.backend.dto.request.LoginRequest;
import com.settlekar.backend.dto.request.PasswordResetRequest;
import com.settlekar.backend.dto.request.SignupRequest;
import com.settlekar.backend.dto.response.AuthResponse;
import com.settlekar.backend.dto.response.MessageResponse;
import com.settlekar.backend.entity.PasswordResetToken;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.entity.VerificationToken;
import com.settlekar.backend.enums.AuthProvider;
import com.settlekar.backend.exception.BadRequestException;
import com.settlekar.backend.exception.ResourceNotFoundException;
import com.settlekar.backend.repository.PasswordResetTokenRepository;
import com.settlekar.backend.repository.UserRepository;
import com.settlekar.backend.repository.VerificationTokenRepository;
import com.settlekar.backend.security.JwtService;
import com.settlekar.backend.util.Constants;
import com.settlekar.backend.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TokenGenerator tokenGenerator;
    private final EmailService emailService;

    /**
     * Register new user
     */
    @Transactional
    public MessageResponse signup(SignupRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(Constants.EMAIL_ALREADY_EXISTS);
        }

        // Check if username already exists (only if provided)
        if (request.getUsername() != null && !request.getUsername().isBlank()
                && userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException(Constants.USERNAME_ALREADY_EXISTS);
        }

        // Create new user
        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .authProvider(AuthProvider.MANUAL)
                .isVerified(false)
                .build();

        // Set optional fields if provided
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername());
        }
        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }

        User savedUser = userRepository.save(user);
        log.info("New user registered: {}", savedUser.getEmail());

        // Create verification token
        String token = tokenGenerator.generateVerificationToken();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(savedUser)
                .expiryDate(LocalDateTime.now().plusHours(Constants.VERIFICATION_TOKEN_EXPIRATION_HOURS))
                .build();

        verificationTokenRepository.save(verificationToken);

        // Send verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), token);

        return MessageResponse.success(Constants.SIGNUP_SUCCESS);
    }

    /**
     * Login user
     */
    public AuthResponse login(LoginRequest request) {
        // Find user first to check auth provider
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException(Constants.INVALID_CREDENTIALS));

        // Check if user registered with Google
        if (user.getAuthProvider() == AuthProvider.GOOGLE && user.getPasswordHash() == null) {
            throw new BadRequestException(
                    "This account uses Google login. Please sign in with Google, " +
                            "or set a password in your profile settings after logging in with Google."
            );
        }

        // Proceed with normal authentication
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Check if account is verified
        if (!user.getIsVerified()) {
            throw new BadRequestException(Constants.ACCOUNT_NOT_VERIFIED);
        }

        // Generate JWT token
        String token = jwtService.generateToken(user);

        log.info("User logged in: {}", user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getDisplayUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getIsVerified()
        );
    }

    /**
     * Verify email with token
     */
    @Transactional
    public MessageResponse verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException(Constants.INVALID_TOKEN));

        // Check if token is expired
        if (verificationToken.isExpired()) {
            throw new BadRequestException(Constants.TOKEN_EXPIRED);
        }

        // Check if token is already used
        if (verificationToken.getIsUsed()) {
            throw new BadRequestException(Constants.TOKEN_ALREADY_USED);
        }

        // Verify user
        User user = verificationToken.getUser();
        user.setIsVerified(true);
        userRepository.save(user);

        // Mark token as used
        verificationToken.setIsUsed(true);
        verificationTokenRepository.save(verificationToken);

        log.info("Email verified for user: {}", user.getEmail());

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

        return MessageResponse.success(Constants.VERIFICATION_SUCCESS);
    }

    /**
     * Request password reset
     */
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException(Constants.USER_NOT_FOUND));

        // Generate reset token
        String token = tokenGenerator.generatePasswordResetToken();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(Constants.PASSWORD_RESET_TOKEN_EXPIRATION_HOURS))
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Send reset email
        emailService.sendPasswordResetEmail(user.getEmail(), token);

        log.info("Password reset requested for user: {}", user.getEmail());

        return MessageResponse.success(Constants.PASSWORD_RESET_EMAIL_SENT);
    }

    /**
     * Reset password with token
     */
    @Transactional
    public MessageResponse resetPassword(PasswordResetRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException(Constants.INVALID_TOKEN));

        // Check if token is expired
        if (resetToken.isExpired()) {
            throw new BadRequestException(Constants.TOKEN_EXPIRED);
        }

        // Check if token is already used
        if (resetToken.getIsUsed()) {
            throw new BadRequestException(Constants.TOKEN_ALREADY_USED);
        }

        // Update password
        User user = resetToken.getUser();

        // 🚫 NEW CHECK: old password cannot be reused
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BadRequestException(Constants.PASSWORD_CANNOT_BE_SAME_AS_OLD);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setIsUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successful for user: {}", user.getEmail());

        return MessageResponse.success(Constants.PASSWORD_RESET_SUCCESS);
    }

    /**
     * Validate password reset token (check if valid, not expired, not used)
     */
    public MessageResponse validateResetToken(String token) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException(Constants.INVALID_TOKEN));

        // Check if token is expired
        if (resetToken.isExpired()) {
            throw new BadRequestException(Constants.TOKEN_EXPIRED);
        }

        // Check if token is already used
        if (resetToken.getIsUsed()) {
            throw new BadRequestException(Constants.TOKEN_ALREADY_USED);
        }

        log.info("Password reset token validated successfully");

        return MessageResponse.success("Token is valid. You can now reset your password.");
    }
}