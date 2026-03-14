package com.settlekar.backend.dto.response;

import com.settlekar.backend.enums.GroupStatus;
import com.settlekar.backend.enums.GroupType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupResponse {

    private UUID id;
    private String name;
    private String description;
    private GroupType type;
    private GroupStatus status;
    private UUID createdById;
    private String createdByName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationMonths;
    private BigDecimal contributionAmount;
    private BigDecimal budgetCap;
    private String joinCode;
    private Integer memberCount;
    private BigDecimal currentUserBalance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
