package com.settlekar.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.settlekar.backend.dto.request.CreatePaymentOrderRequest;
import com.settlekar.backend.dto.request.VerifyPaymentRequest;
import com.settlekar.backend.dto.response.PaymentOrderResponse;
import com.settlekar.backend.dto.response.PaymentResponse;
import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.Payment;
import com.settlekar.backend.entity.Settlement;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.LedgerEntryType;
import com.settlekar.backend.enums.PaymentStatus;
import com.settlekar.backend.enums.SettlementStatus;
import com.settlekar.backend.exception.BadRequestException;
import com.settlekar.backend.exception.ResourceNotFoundException;
import com.settlekar.backend.repository.PaymentRepository;
import com.settlekar.backend.repository.SettlementRepository;
import com.settlekar.backend.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final SettlementRepository settlementRepository;
    private final SettlementService settlementService;
    private final TransactionLedgerService ledgerService;
    private final EmailService emailService;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Transactional
    public PaymentOrderResponse createOrder(CreatePaymentOrderRequest request, User currentUser) {
        Settlement settlement = settlementService.findSettlementById(request.getSettlementId());

        if (settlement.getStatus() == SettlementStatus.COMPLETED) {
            throw new BadRequestException("This settlement has already been completed.");
        }

        // Check if a payment order already exists for this settlement
        Payment existingPayment = paymentRepository.findBySettlement(settlement).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.CREATED) {
            // Reuse the existing Razorpay order
            return PaymentOrderResponse.builder()
                    .razorpayOrderId(existingPayment.getRazorpayOrderId())
                    .amount(existingPayment.getAmount())
                    .currency(existingPayment.getCurrency())
                    .razorpayKeyId(razorpayKeyId)
                    .build();
        }

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", settlement.getAmount().multiply(BigDecimal.valueOf(100)).longValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "stl_" + settlement.getId().toString().substring(0, 35));

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String orderId = razorpayOrder.get("id");
            log.info("Razorpay order created: {}", orderId);

            Payment payment = Payment.builder()
                    .settlement(settlement)
                    .razorpayOrderId(orderId)
                    .amount(settlement.getAmount())
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .payer(currentUser)
                    .build();

            paymentRepository.save(payment);

            return PaymentOrderResponse.builder()
                    .razorpayOrderId(orderId)
                    .amount(settlement.getAmount())
                    .currency("INR")
                    .razorpayKeyId(razorpayKeyId)
                    .build();
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to create payment order: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentResponse verifyPayment(VerifyPaymentRequest request, User currentUser) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(Constants.PAYMENT_NOT_FOUND));

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);

            if (!isValid) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                throw new BadRequestException(Constants.PAYMENT_VERIFICATION_FAILED);
            }

            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(PaymentStatus.CAPTURED);
            paymentRepository.save(payment);

            // Update settlement status
            Settlement settlement = payment.getSettlement();
            settlement.setStatus(SettlementStatus.COMPLETED);
            settlement.setSettledAt(LocalDateTime.now());
            settlementRepository.save(settlement);

            Group group = settlement.getGroup();
            ledgerService.appendEntry(group, LedgerEntryType.SETTLEMENT_COMPLETED, currentUser,
                    "Payment of Rs. " + payment.getAmount() + " completed via Razorpay",
                    payment.getId(), "PAYMENT", null);

            // Send confirmation emails
            emailService.sendSettlementConfirmationEmail(
                    settlement.getPayer().getEmail(),
                    settlement.getPayer().getFirstName(),
                    settlement.getReceiver().getFirstName(),
                    settlement.getAmount(),
                    group.getName()
            );

            return mapToPaymentResponse(payment);
        } catch (RazorpayException e) {
            log.error("Payment verification failed", e);
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BadRequestException(Constants.PAYMENT_VERIFICATION_FAILED);
        }
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        try {
            boolean isValid = Utils.verifyWebhookSignature(payload, signature, razorpayKeySecret);
            if (!isValid) {
                log.warn("Invalid webhook signature");
                return;
            }

            JSONObject webhookData = new JSONObject(payload);
            String event = webhookData.getString("event");

            if ("payment.captured".equals(event)) {
                JSONObject paymentEntity = webhookData.getJSONObject("payload")
                        .getJSONObject("payment").getJSONObject("entity");
                String orderId = paymentEntity.getString("order_id");

                paymentRepository.findByRazorpayOrderId(orderId).ifPresent(payment -> {
                    if (payment.getStatus() != PaymentStatus.CAPTURED) {
                        payment.setStatus(PaymentStatus.CAPTURED);
                        payment.setRazorpayPaymentId(paymentEntity.getString("id"));
                        paymentRepository.save(payment);

                        Settlement settlement = payment.getSettlement();
                        if (settlement.getStatus() != SettlementStatus.COMPLETED) {
                            settlement.setStatus(SettlementStatus.COMPLETED);
                            settlement.setSettledAt(LocalDateTime.now());
                            settlementRepository.save(settlement);
                        }
                    }
                });
            }
        } catch (Exception e) {
            log.error("Error processing webhook", e);
        }
    }

    public PaymentResponse getPayment(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.PAYMENT_NOT_FOUND));
        return mapToPaymentResponse(payment);
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .settlementId(payment.getSettlement().getId())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .payerId(payment.getPayer().getId())
                .payerName(payment.getPayer().getFirstName() + " " + payment.getPayer().getLastName())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
