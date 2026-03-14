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
public class BalanceSummaryResponse {

    private UUID userId;
    private String username;
    private String firstName;
    private String lastName;
    private BigDecimal netBalance;
}
