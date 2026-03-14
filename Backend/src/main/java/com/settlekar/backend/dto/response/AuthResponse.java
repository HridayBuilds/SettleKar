package com.settlekar.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private UUID userId;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private Boolean isVerified;

    public AuthResponse(String accessToken, UUID userId, String email, String username,
                        String firstName, String lastName, Boolean isVerified) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.isVerified = isVerified;
    }
}