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
public class PaymentOrderResponse {

    private String razorpayOrderId;
    private BigDecimal amount;
    private String currency;
    private String razorpayKeyId;
}
