package com.settlekar.backend.service;

import com.settlekar.backend.dto.request.CreateSettlementRequest;
import com.settlekar.backend.dto.response.BalanceSummaryResponse;
import com.settlekar.backend.dto.response.SettlementResponse;
import com.settlekar.backend.dto.response.SettlementSuggestionResponse;
import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.Settlement;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.LedgerEntryType;
import com.settlekar.backend.enums.SettlementStatus;
import com.settlekar.backend.exception.BadRequestException;
import com.settlekar.backend.exception.ResourceNotFoundException;
import com.settlekar.backend.repository.SettlementRepository;
import com.settlekar.backend.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final GroupService groupService;
    private final UserService userService;
    private final BalanceService balanceService;
    private final TransactionLedgerService ledgerService;
    private final EmailService emailService;

    public List<SettlementSuggestionResponse> optimizeSettlements(UUID groupId, User currentUser) {
        List<BalanceSummaryResponse> balances = balanceService.getBalanceSummary(groupId, currentUser);

        // Separate into creditors (positive balance) and debtors (negative balance)
        List<BalanceSummaryResponse> creditors = new ArrayList<>();
        List<BalanceSummaryResponse> debtors = new ArrayList<>();

        for (BalanceSummaryResponse b : balances) {
            if (b.getNetBalance().compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(b);
            } else if (b.getNetBalance().compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(b);
            }
        }

        // Sort by absolute value descending
        creditors.sort((a, b) -> b.getNetBalance().compareTo(a.getNetBalance()));
        debtors.sort((a, b) -> a.getNetBalance().compareTo(b.getNetBalance()));

        // Greedy matching
        List<SettlementSuggestionResponse> suggestions = new ArrayList<>();
        Map<UUID, BigDecimal> creditMap = new HashMap<>();
        Map<UUID, BigDecimal> debtMap = new HashMap<>();

        for (BalanceSummaryResponse c : creditors) creditMap.put(c.getUserId(), c.getNetBalance());
        for (BalanceSummaryResponse d : debtors) debtMap.put(d.getUserId(), d.getNetBalance().abs());

        Map<UUID, BalanceSummaryResponse> balanceMap = new HashMap<>();
        for (BalanceSummaryResponse b : balances) balanceMap.put(b.getUserId(), b);

        while (!creditMap.isEmpty() && !debtMap.isEmpty()) {
            UUID creditorId = creditMap.entrySet().stream()
                    .max(Map.Entry.comparingByValue()).get().getKey();
            UUID debtorId = debtMap.entrySet().stream()
                    .max(Map.Entry.comparingByValue()).get().getKey();

            BigDecimal creditAmount = creditMap.get(creditorId);
            BigDecimal debtAmount = debtMap.get(debtorId);
            BigDecimal settleAmount = creditAmount.min(debtAmount);

            BalanceSummaryResponse creditor = balanceMap.get(creditorId);
            BalanceSummaryResponse debtor = balanceMap.get(debtorId);

            suggestions.add(SettlementSuggestionResponse.builder()
                    .fromUserId(debtorId)
                    .fromName(debtor.getFirstName() + " " + debtor.getLastName())
                    .toUserId(creditorId)
                    .toName(creditor.getFirstName() + " " + creditor.getLastName())
                    .amount(settleAmount)
                    .build());

            BigDecimal remainingCredit = creditAmount.subtract(settleAmount);
            BigDecimal remainingDebt = debtAmount.subtract(settleAmount);

            if (remainingCredit.compareTo(BigDecimal.ZERO) == 0) {
                creditMap.remove(creditorId);
            } else {
                creditMap.put(creditorId, remainingCredit);
            }

            if (remainingDebt.compareTo(BigDecimal.ZERO) == 0) {
                debtMap.remove(debtorId);
            } else {
                debtMap.put(debtorId, remainingDebt);
            }
        }

        return suggestions;
    }

    @Transactional
    public SettlementResponse createSettlement(UUID groupId, CreateSettlementRequest request, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);

        User payer = userService.getUserById(request.getPayerId());
        User receiver = userService.getUserById(request.getReceiverId());

        Settlement settlement = Settlement.builder()
                .group(group)
                .payer(payer)
                .receiver(receiver)
                .amount(request.getAmount())
                .status(SettlementStatus.PENDING)
                .method(request.getMethod())
                .notes(request.getNotes())
                .build();

        Settlement savedSettlement = settlementRepository.save(settlement);

        ledgerService.appendEntry(group, LedgerEntryType.SETTLEMENT_CREATED, currentUser,
                payer.getFirstName() + " initiated settlement of Rs. " + request.getAmount() + " to " + receiver.getFirstName(),
                savedSettlement.getId(), "SETTLEMENT", null);

        return mapToSettlementResponse(savedSettlement);
    }

    @Transactional
    public SettlementResponse confirmSettlement(UUID groupId, UUID settlementId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        Settlement settlement = findSettlementById(settlementId);

        if (!settlement.getReceiver().getId().equals(currentUser.getId())) {
            throw new BadRequestException(Constants.ONLY_RECEIVER_CAN_CONFIRM);
        }

        settlement.setStatus(SettlementStatus.COMPLETED);
        settlement.setSettledAt(LocalDateTime.now());
        Settlement confirmedSettlement = settlementRepository.save(settlement);

        ledgerService.appendEntry(group, LedgerEntryType.SETTLEMENT_COMPLETED, currentUser,
                "Settlement of Rs. " + settlement.getAmount() + " confirmed by " + currentUser.getFirstName(),
                confirmedSettlement.getId(), "SETTLEMENT", null);

        // Send confirmation emails
        emailService.sendSettlementConfirmationEmail(
                settlement.getPayer().getEmail(),
                settlement.getPayer().getFirstName(),
                settlement.getReceiver().getFirstName(),
                settlement.getAmount(),
                group.getName()
        );
        emailService.sendSettlementConfirmationEmail(
                settlement.getReceiver().getEmail(),
                settlement.getPayer().getFirstName(),
                settlement.getReceiver().getFirstName(),
                settlement.getAmount(),
                group.getName()
        );

        return mapToSettlementResponse(confirmedSettlement);
    }

    public Page<SettlementResponse> getSettlements(UUID groupId, Pageable pageable, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);
        return settlementRepository.findByGroup(group, pageable).map(this::mapToSettlementResponse);
    }

    public Settlement findSettlementById(UUID settlementId) {
        return settlementRepository.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.SETTLEMENT_NOT_FOUND));
    }

    private SettlementResponse mapToSettlementResponse(Settlement settlement) {
        return SettlementResponse.builder()
                .id(settlement.getId())
                .groupId(settlement.getGroup().getId())
                .payerId(settlement.getPayer().getId())
                .payerName(settlement.getPayer().getFirstName() + " " + settlement.getPayer().getLastName())
                .receiverId(settlement.getReceiver().getId())
                .receiverName(settlement.getReceiver().getFirstName() + " " + settlement.getReceiver().getLastName())
                .amount(settlement.getAmount())
                .status(settlement.getStatus())
                .method(settlement.getMethod())
                .notes(settlement.getNotes())
                .settledAt(settlement.getSettledAt())
                .createdAt(settlement.getCreatedAt())
                .build();
    }
}
