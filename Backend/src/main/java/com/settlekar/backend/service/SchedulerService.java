package com.settlekar.backend.service;

import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.GroupMember;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.GroupStatus;
import com.settlekar.backend.enums.GroupType;
import com.settlekar.backend.repository.GroupMemberRepository;
import com.settlekar.backend.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchedulerService {

    private final RecurringExpenseService recurringExpenseService;
    private final ReminderService reminderService;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final EmailService emailService;
    private final BalanceService balanceService;

    @Scheduled(cron = "0 0 2 * * *")
    public void processRecurringExpenses() {
        log.info("Running scheduled task: process recurring expenses");
        recurringExpenseService.processRecurringExpenses();
    }

    @Scheduled(cron = "0 0 9 * * *")
    public void processPaymentReminders() {
        log.info("Running scheduled task: process payment reminders");
        reminderService.processPaymentReminders();
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void processGroupLifecycles() {
        log.info("Running scheduled task: process group lifecycles");

        // Auto-lock TRAVEL and EVENT groups past end date
        List<Group> expiredGroups = groupRepository.findByStatusAndEndDateBefore(
                GroupStatus.ACTIVE, LocalDate.now());

        for (Group group : expiredGroups) {
            if (group.getType() == GroupType.TRAVEL || group.getType() == GroupType.EVENT) {
                group.setStatus(GroupStatus.LOCKED);
                groupRepository.save(group);
                log.info("Group '{}' auto-locked (past end date)", group.getName());
            }
        }

        // Send monthly summary for HOSTEL groups on 1st of each month
        if (LocalDate.now().getDayOfMonth() == 1) {
            List<Group> activeGroups = groupRepository.findByStatus(GroupStatus.ACTIVE);
            for (Group group : activeGroups) {
                if (group.getType() == GroupType.HOSTEL) {
                    sendMonthlyHostelSummary(group);
                }
            }
        }
    }

    private void sendMonthlyHostelSummary(Group group) {
        try {
            List<GroupMember> members = groupMemberRepository.findByGroupAndIsActiveTrue(group);
            if (members.isEmpty()) return;

            User firstMember = members.get(0).getUser();
            var balances = balanceService.getBalanceSummary(group.getId(), firstMember);

            StringBuilder summary = new StringBuilder();
            for (var balance : balances) {
                summary.append(balance.getFirstName())
                        .append(" ").append(balance.getLastName())
                        .append(": Rs. ").append(balance.getNetBalance().toPlainString())
                        .append("\n");
            }

            for (GroupMember member : members) {
                emailService.sendMonthlySettlementSummaryEmail(
                        member.getUser().getEmail(),
                        member.getUser().getFirstName(),
                        group.getName(),
                        summary.toString()
                );
            }

            log.info("Monthly summary sent for hostel group: {}", group.getName());
        } catch (Exception e) {
            log.error("Failed to send monthly summary for group: {}", group.getId(), e);
        }
    }
}
