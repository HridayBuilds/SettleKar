package com.settlekar.backend.service;

import com.settlekar.backend.dto.response.*;
import com.settlekar.backend.entity.*;
import com.settlekar.backend.enums.SettlementStatus;
import com.settlekar.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BalanceService {

    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseShareRepository expenseShareRepository;
    private final SettlementRepository settlementRepository;
    private final GroupService groupService;

    public List<BalanceSummaryResponse> getBalanceSummary(UUID groupId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);

        List<GroupMember> members = groupMemberRepository.findByGroupAndIsActiveTrue(group);
        List<Expense> expenses = expenseRepository.findByGroup(group);
        List<Settlement> settlements = settlementRepository.findByGroupAndStatus(group, SettlementStatus.COMPLETED);

        Map<UUID, BigDecimal> balances = new HashMap<>();
        for (GroupMember member : members) {
            balances.put(member.getUser().getId(), BigDecimal.ZERO);
        }

        // Add what each person paid
        for (Expense expense : expenses) {
            UUID payerId = expense.getPaidBy().getId();
            balances.merge(payerId, expense.getAmount(), BigDecimal::add);
        }

        // Subtract what each person owes
        for (Expense expense : expenses) {
            for (ExpenseShare share : expense.getShares()) {
                UUID userId = share.getUser().getId();
                balances.merge(userId, share.getShareAmount().negate(), BigDecimal::add);
            }
        }

        // Account for completed settlements
        for (Settlement settlement : settlements) {
            balances.merge(settlement.getPayer().getId(), settlement.getAmount().negate(), BigDecimal::add);
            balances.merge(settlement.getReceiver().getId(), settlement.getAmount(), BigDecimal::add);
        }

        return members.stream()
                .map(member -> {
                    User user = member.getUser();
                    return BalanceSummaryResponse.builder()
                            .userId(user.getId())
                            .username(user.getDisplayUsername())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .netBalance(balances.getOrDefault(user.getId(), BigDecimal.ZERO))
                            .build();
                })
                .toList();
    }

    public List<PairwiseBalanceResponse> getPairwiseBalances(UUID groupId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);

        List<GroupMember> members = groupMemberRepository.findByGroupAndIsActiveTrue(group);
        List<Expense> expenses = expenseRepository.findByGroup(group);
        List<Settlement> settlements = settlementRepository.findByGroupAndStatus(group, SettlementStatus.COMPLETED);

        // Build pairwise debt map: debts[A][B] = how much A owes B
        Map<UUID, Map<UUID, BigDecimal>> debts = new HashMap<>();
        for (GroupMember m : members) {
            debts.put(m.getUser().getId(), new HashMap<>());
        }

        for (Expense expense : expenses) {
            UUID payerId = expense.getPaidBy().getId();
            for (ExpenseShare share : expense.getShares()) {
                UUID userId = share.getUser().getId();
                if (!userId.equals(payerId)) {
                    debts.get(userId).merge(payerId, share.getShareAmount(), BigDecimal::add);
                }
            }
        }

        // Subtract completed settlements
        for (Settlement settlement : settlements) {
            UUID payerId = settlement.getPayer().getId();
            UUID receiverId = settlement.getReceiver().getId();
            debts.getOrDefault(payerId, new HashMap<>())
                    .merge(receiverId, settlement.getAmount().negate(), BigDecimal::add);
        }

        // Net out pairwise debts
        List<PairwiseBalanceResponse> result = new ArrayList<>();
        Set<String> processed = new HashSet<>();

        for (GroupMember m1 : members) {
            for (GroupMember m2 : members) {
                UUID id1 = m1.getUser().getId();
                UUID id2 = m2.getUser().getId();
                if (id1.equals(id2)) continue;

                String key = id1.compareTo(id2) < 0 ? id1 + "-" + id2 : id2 + "-" + id1;
                if (processed.contains(key)) continue;
                processed.add(key);

                BigDecimal owes1to2 = debts.getOrDefault(id1, Map.of()).getOrDefault(id2, BigDecimal.ZERO);
                BigDecimal owes2to1 = debts.getOrDefault(id2, Map.of()).getOrDefault(id1, BigDecimal.ZERO);
                BigDecimal net = owes1to2.subtract(owes2to1);

                if (net.compareTo(BigDecimal.ZERO) > 0) {
                    result.add(PairwiseBalanceResponse.builder()
                            .fromUserId(id1).fromName(m1.getUser().getFirstName())
                            .toUserId(id2).toName(m2.getUser().getFirstName())
                            .amount(net).build());
                } else if (net.compareTo(BigDecimal.ZERO) < 0) {
                    result.add(PairwiseBalanceResponse.builder()
                            .fromUserId(id2).fromName(m2.getUser().getFirstName())
                            .toUserId(id1).toName(m1.getUser().getFirstName())
                            .amount(net.abs()).build());
                }
            }
        }

        return result;
    }

    public DebtGraphResponse getDebtGraph(UUID groupId, User currentUser) {
        List<BalanceSummaryResponse> balances = getBalanceSummary(groupId, currentUser);
        List<PairwiseBalanceResponse> pairwise = getPairwiseBalances(groupId, currentUser);

        List<DebtGraphResponse.NodeDTO> nodes = balances.stream()
                .map(b -> DebtGraphResponse.NodeDTO.builder()
                        .userId(b.getUserId())
                        .name(b.getFirstName() + " " + b.getLastName())
                        .netBalance(b.getNetBalance())
                        .build())
                .toList();

        List<DebtGraphResponse.EdgeDTO> edges = pairwise.stream()
                .map(p -> DebtGraphResponse.EdgeDTO.builder()
                        .fromUserId(p.getFromUserId()).fromName(p.getFromName())
                        .toUserId(p.getToUserId()).toName(p.getToName())
                        .amount(p.getAmount())
                        .build())
                .toList();

        return DebtGraphResponse.builder().nodes(nodes).edges(edges).build();
    }
}
