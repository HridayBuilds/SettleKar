package com.settlekar.backend.dto.request;

import com.settlekar.backend.enums.SettlementMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSettlementRequest {

    @NotNull(message = "Payer ID is required")
    private UUID payerId;

    @NotNull(message = "Receiver ID is required")
    private UUID receiverId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Settlement method is required")
    private SettlementMethod method;

    private String notes;
}
