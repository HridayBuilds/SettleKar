package com.settlekar.backend.controller;

import com.settlekar.backend.dto.request.CreatePaymentOrderRequest;
import com.settlekar.backend.dto.request.VerifyPaymentRequest;
import com.settlekar.backend.dto.response.PaymentOrderResponse;
import com.settlekar.backend.dto.response.PaymentResponse;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @Valid @RequestBody CreatePaymentOrderRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(paymentService.createOrder(request, currentUser));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(paymentService.verifyPayment(request, currentUser));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable UUID paymentId) {
        return ResponseEntity.ok(paymentService.getPayment(paymentId));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok("OK");
    }
}
