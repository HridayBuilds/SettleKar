package com.settlekar.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseShareRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    private BigDecimal shareAmount;
    private Double sharePercentage;
}
