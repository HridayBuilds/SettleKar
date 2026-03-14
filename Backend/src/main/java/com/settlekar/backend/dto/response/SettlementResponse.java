package com.settlekar.backend.dto.response;

import com.settlekar.backend.enums.SettlementMethod;
import com.settlekar.backend.enums.SettlementStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementResponse {

    private UUID id;
    private UUID groupId;
    private UUID payerId;
    private String payerName;
    private UUID receiverId;
    private String receiverName;
    private BigDecimal amount;
    private SettlementStatus status;
    private SettlementMethod method;
    private String notes;
    private LocalDateTime settledAt;
    private LocalDateTime createdAt;
}
