package com.settlekar.backend.dto.response;

import com.settlekar.backend.enums.AuthProvider;
import com.settlekar.backend.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private UUID id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String phone;
    private Gender gender;
    private AuthProvider authProvider;
    private Boolean isVerified;
    private LocalDateTime createdAt;
}