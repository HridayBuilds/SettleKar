package com.settlekar.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementSuggestionResponse {

    private UUID fromUserId;
    private String fromName;
    private UUID toUserId;
    private String toName;
    private BigDecimal amount;
}
