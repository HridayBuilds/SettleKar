package com.settlekar.backend.service;

import com.settlekar.backend.dto.response.BalanceSummaryResponse;
import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.GroupMember;
import com.settlekar.backend.entity.PaymentReminder;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.LedgerEntryType;
import com.settlekar.backend.enums.ReminderType;
import com.settlekar.backend.repository.GroupMemberRepository;
import com.settlekar.backend.repository.PaymentReminderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderService {

    private final PaymentReminderRepository paymentReminderRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final BalanceService balanceService;
    private final EmailService emailService;
    private final TransactionLedgerService ledgerService;

    @Transactional
    public void processPaymentReminders() {
        // Get all active group memberships and check balances
        // This is called by the scheduler
        log.info("Processing payment reminders...");

        // Get all unique groups from active memberships
        List<GroupMember> allMemberships = groupMemberRepository.findAll().stream()
                .filter(GroupMember::getIsActive).toList();

        // Group by group
        allMemberships.stream()
                .map(GroupMember::getGroup)
                .distinct()
                .forEach(group -> processGroupReminders(group));
    }

    private void processGroupReminders(Group group) {
        try {
            List<GroupMember> members = groupMemberRepository.findByGroupAndIsActiveTrue(group);
            if (members.isEmpty()) return;

            User firstMember = members.get(0).getUser();

            List<BalanceSummaryResponse> balances = balanceService.getBalanceSummary(group.getId(), firstMember);

            for (BalanceSummaryResponse balance : balances) {
                if (balance.getNetBalance().compareTo(BigDecimal.ZERO) < 0) {
                    User debtor = members.stream()
                            .map(GroupMember::getUser)
                            .filter(u -> u.getId().equals(balance.getUserId()))
                            .findFirst().orElse(null);
                    if (debtor == null) continue;

                    // Find who they owe the most to
                    BalanceSummaryResponse topCreditor = balances.stream()
                            .filter(b -> b.getNetBalance().compareTo(BigDecimal.ZERO) > 0)
                            .max((a, b) -> a.getNetBalance().compareTo(b.getNetBalance()))
                            .orElse(null);
                    if (topCreditor == null) continue;

                    User creditor = members.stream()
                            .map(GroupMember::getUser)
                            .filter(u -> u.getId().equals(topCreditor.getUserId()))
                            .findFirst().orElse(null);
                    if (creditor == null) continue;

                    BigDecimal amount = balance.getNetBalance().abs();

                    boolean gentleSent = paymentReminderRepository.existsByDebtorAndCreditorAndGroupAndReminderType(
                            debtor, creditor, group, ReminderType.GENTLE);

                    if (!gentleSent) {
                        // No GENTLE reminder sent yet -> send GENTLE
                        sendReminder(group, debtor, creditor, amount, ReminderType.GENTLE);
                    } else {
                        boolean formalSent = paymentReminderRepository.existsByDebtorAndCreditorAndGroupAndReminderType(
                                debtor, creditor, group, ReminderType.FORMAL);

                        if (!formalSent) {
                            // GENTLE was sent but no FORMAL yet -> check if 3 days have passed
                            Optional<PaymentReminder> latestGentle = paymentReminderRepository
                                    .findTopByDebtorAndCreditorAndGroupAndReminderTypeOrderBySentAtDesc(
                                            debtor, creditor, group, ReminderType.GENTLE);
                            if (latestGentle.isPresent()
                                    && latestGentle.get().getSentAt().isBefore(LocalDateTime.now().minusDays(3))) {
                                sendReminder(group, debtor, creditor, amount, ReminderType.FORMAL);
                            }
                        } else {
                            // FORMAL was already sent -> check if 7 days have passed for repeat
                            Optional<PaymentReminder> latestFormal = paymentReminderRepository
                                    .findTopByDebtorAndCreditorAndGroupAndReminderTypeOrderBySentAtDesc(
                                            debtor, creditor, group, ReminderType.FORMAL);
                            if (latestFormal.isPresent()
                                    && latestFormal.get().getSentAt().isBefore(LocalDateTime.now().minusDays(7))) {
                                sendReminder(group, debtor, creditor, amount, ReminderType.FORMAL);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing reminders for group: {}", group.getId(), e);
        }
    }

    private void sendReminder(Group group, User debtor, User creditor, BigDecimal amount, ReminderType type) {
        emailService.sendPaymentReminderEmail(
                debtor.getEmail(),
                creditor.getFirstName(),
                amount,
                group.getName(),
                type.name()
        );

        PaymentReminder reminder = PaymentReminder.builder()
                .group(group)
                .debtor(debtor)
                .creditor(creditor)
                .amount(amount)
                .reminderType(type)
                .build();
        paymentReminderRepository.save(reminder);

        ledgerService.appendEntry(group, LedgerEntryType.REMINDER_SENT, debtor,
                type.name() + " reminder sent to " + debtor.getFirstName() + " for Rs. " + amount,
                null, "REMINDER", null);

        log.info("{} reminder sent to {} for Rs. {} in group {}",
                type, debtor.getEmail(), amount, group.getName());
    }
}
