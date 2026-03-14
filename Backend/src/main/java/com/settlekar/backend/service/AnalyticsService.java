package com.settlekar.backend.service;

import com.settlekar.backend.dto.response.AnalyticsResponse;
import com.settlekar.backend.entity.Expense;
import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.GroupMember;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.repository.ExpenseRepository;
import com.settlekar.backend.repository.ExpenseShareRepository;
import com.settlekar.backend.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseShareRepository expenseShareRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupService groupService;

    public List<AnalyticsResponse.CategoryBreakdown> getCategoryBreakdown(UUID groupId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);

        List<Expense> expenses = expenseRepository.findByGroup(group);
        BigDecimal total = expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> categoryTotals = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        return categoryTotals.entrySet().stream()
                .map(entry -> AnalyticsResponse.CategoryBreakdown.builder()
                        .category(entry.getKey())
                        .totalAmount(entry.getValue())
                        .percentage(total.compareTo(BigDecimal.ZERO) > 0 ?
                                entry.getValue().divide(total, 4, RoundingMode.HALF_UP)
                                        .multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0)
                        .build())
                .sorted((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()))
                .toList();
    }

    public List<AnalyticsResponse.MonthlyBreakdown> getMonthlyBreakdown(UUID groupId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);

        List<Expense> expenses = expenseRepository.findByGroup(group);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        Map<String, List<Expense>> monthlyGroups = expenses.stream()
                .collect(Collectors.groupingBy(e -> e.getCreatedAt().format(formatter)));

        return monthlyGroups.entrySet().stream()
                .map(entry -> AnalyticsResponse.MonthlyBreakdown.builder()
                        .month(entry.getKey())
                        .totalAmount(entry.getValue().stream()
                                .map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .expenseCount(entry.getValue().size())
                        .build())
                .sorted(Comparator.comparing(AnalyticsResponse.MonthlyBreakdown::getMonth))
                .toList();
    }

    public List<AnalyticsResponse.MemberBreakdown> getMemberBreakdown(UUID groupId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);

        List<Expense> expenses = expenseRepository.findByGroup(group);
        List<GroupMember> members = groupMemberRepository.findByGroupAndIsActiveTrue(group);

        return members.stream().map(member -> {
            User user = member.getUser();
            BigDecimal totalPaid = expenses.stream()
                    .filter(e -> e.getPaidBy().getId().equals(user.getId()))
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalOwed = expenseShareRepository.findByUserIdAndExpenseGroupId(user.getId(), groupId)
                    .stream().map(share -> share.getShareAmount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return AnalyticsResponse.MemberBreakdown.builder()
                    .memberName(user.getFirstName() + " " + user.getLastName())
                    .totalPaid(totalPaid)
                    .totalOwed(totalOwed)
                    .build();
        }).toList();
    }
}
