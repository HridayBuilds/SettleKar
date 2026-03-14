package com.settlekar.backend.dto.request;

import com.settlekar.backend.enums.GroupType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupRequest {

    @NotBlank(message = "Group name is required")
    @Size(max = 100, message = "Group name cannot exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Group type is required")
    private GroupType type;

    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationMonths;
    private BigDecimal contributionAmount;
    private BigDecimal budgetCap;
}
