package com.settlekar.backend.dto.response;

import com.settlekar.backend.enums.GroupRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMemberResponse {

    private UUID userId;
    private String username;
    private String firstName;
    private String lastName;
    private GroupRole role;
    private LocalDateTime joinedAt;
}
