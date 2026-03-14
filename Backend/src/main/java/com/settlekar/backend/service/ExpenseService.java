package com.settlekar.backend.service;

import com.settlekar.backend.dto.request.CreateExpenseRequest;
import com.settlekar.backend.dto.request.ExpenseShareRequest;
import com.settlekar.backend.dto.request.UpdateExpenseRequest;
import com.settlekar.backend.dto.response.ExpenseResponse;
import com.settlekar.backend.dto.response.ExpenseShareResponse;
import com.settlekar.backend.entity.*;
import com.settlekar.backend.enums.GroupType;
import com.settlekar.backend.enums.LedgerEntryType;
import com.settlekar.backend.enums.SplitMethod;
import com.settlekar.backend.exception.BadRequestException;
import com.settlekar.backend.exception.BudgetCapExceededException;
import com.settlekar.backend.exception.ResourceNotFoundException;
import com.settlekar.backend.exception.UnauthorizedException;
import com.settlekar.backend.repository.ExpenseRepository;
import com.settlekar.backend.repository.ExpenseShareRepository;
import com.settlekar.backend.repository.GroupMemberRepository;
import com.settlekar.backend.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseShareRepository expenseShareRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupService groupService;
    private final UserService userService;
    private final TransactionLedgerService ledgerService;
    private final S3Service s3Service;

    @Transactional
    public ExpenseResponse createExpense(UUID groupId, CreateExpenseRequest request, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);
        groupService.verifyGroupNotLocked(group);

        // Budget check for EVENT groups
        if (group.getType() == GroupType.EVENT && group.getBudgetCap() != null) {
            BigDecimal totalSpent = expenseRepository.sumAmountByGroupId(groupId);
            if (totalSpent.add(request.getAmount()).compareTo(group.getBudgetCap()) > 0) {
                throw new BudgetCapExceededException(Constants.BUDGET_CAP_EXCEEDED);
            }
        }

        User payer = userService.getUserById(request.getPaidByUserId());

        Expense expense = Expense.builder()
                .group(group)
                .description(request.getDescription())
                .amount(request.getAmount())
                .category(request.getCategory())
                .splitMethod(request.getSplitMethod())
                .paidBy(payer)
                .build();

        if (request.getReceiptUrl() != null && !request.getReceiptUrl().isBlank()) {
            expense.setReceiptUrl(request.getReceiptUrl());
        }

        Expense savedExpense = expenseRepository.save(expense);

        // Compute and save shares
        List<ExpenseShare> shares = computeShares(savedExpense, request.getSplitMethod(),
                request.getAmount(), request.getShares(), group);
        savedExpense.setShares(shares);

        ledgerService.appendEntry(group, LedgerEntryType.EXPENSE_ADDED, currentUser,
                "Expense '" + request.getDescription() + "' of Rs. " + request.getAmount() + " added",
                savedExpense.getId(), "EXPENSE", null);

        log.info("Expense created: {} in group {}", request.getDescription(), group.getName());
        return mapToExpenseResponse(savedExpense);
    }

    public Page<ExpenseResponse> getExpenses(UUID groupId, Pageable pageable, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);
        return expenseRepository.findByGroup(group, pageable).map(this::mapToExpenseResponse);
    }

    public ExpenseResponse getExpenseById(UUID groupId, UUID expenseId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);
        Expense expense = findExpenseById(expenseId);
        return mapToExpenseResponse(expense);
    }

    @Transactional
    public ExpenseResponse updateExpense(UUID groupId, UUID expenseId, UpdateExpenseRequest request, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyGroupNotLocked(group);
        Expense expense = findExpenseById(expenseId);

        // Verify ownership or admin
        if (!expense.getPaidBy().getId().equals(currentUser.getId())) {
            groupService.verifyAdmin(group, currentUser);
        }

        User payer = userService.getUserById(request.getPaidByUserId());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setSplitMethod(request.getSplitMethod());
        expense.setPaidBy(payer);

        // Clear old shares and compute new ones
        expense.getShares().clear();
        expenseRepository.save(expense);

        List<ExpenseShare> newShares = computeShares(expense, request.getSplitMethod(),
                request.getAmount(), request.getShares(), group);
        expense.setShares(newShares);

        Expense updatedExpense = expenseRepository.save(expense);

        ledgerService.appendEntry(group, LedgerEntryType.EXPENSE_UPDATED, currentUser,
                "Expense '" + request.getDescription() + "' updated",
                updatedExpense.getId(), "EXPENSE", null);

        return mapToExpenseResponse(updatedExpense);
    }

    @Transactional
    public void deleteExpense(UUID groupId, UUID expenseId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyGroupNotLocked(group);
        Expense expense = findExpenseById(expenseId);

        if (!expense.getPaidBy().getId().equals(currentUser.getId())) {
            groupService.verifyAdmin(group, currentUser);
        }

        ledgerService.appendEntry(group, LedgerEntryType.EXPENSE_DELETED, currentUser,
                "Expense '" + expense.getDescription() + "' of Rs. " + expense.getAmount() + " deleted",
                expense.getId(), "EXPENSE", null);

        expenseRepository.delete(expense);
        log.info("Expense deleted: {} from group {}", expenseId, group.getName());
    }

    @Transactional
    public ExpenseResponse uploadReceipt(UUID groupId, UUID expenseId, MultipartFile file, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);
        Expense expense = findExpenseById(expenseId);

        String receiptUrl = s3Service.uploadFile(file, "receipts");
        expense.setReceiptUrl(receiptUrl);
        Expense updatedExpense = expenseRepository.save(expense);

        return mapToExpenseResponse(updatedExpense);
    }

    private Expense findExpenseById(UUID expenseId) {
        return expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.EXPENSE_NOT_FOUND));
    }

    private List<ExpenseShare> computeShares(Expense expense, SplitMethod splitMethod,
                                              BigDecimal totalAmount, List<ExpenseShareRequest> shareRequests,
                                              Group group) {
        List<ExpenseShare> shares = new ArrayList<>();

        if (splitMethod == SplitMethod.EQUAL) {
            List<GroupMember> members = groupMemberRepository.findByGroupAndIsActiveTrue(group);
            BigDecimal shareAmount = totalAmount.divide(BigDecimal.valueOf(members.size()), 2, RoundingMode.HALF_UP);

            for (GroupMember member : members) {
                ExpenseShare share = ExpenseShare.builder()
                        .expense(expense)
                        .user(member.getUser())
                        .shareAmount(shareAmount)
                        .build();
                shares.add(expenseShareRepository.save(share));
            }
        } else if (splitMethod == SplitMethod.PERCENTAGE) {
            if (shareRequests == null || shareRequests.isEmpty()) {
                throw new BadRequestException("Share details are required for PERCENTAGE split");
            }
            double totalPercentage = shareRequests.stream()
                    .mapToDouble(s -> s.getSharePercentage() != null ? s.getSharePercentage() : 0)
                    .sum();
            if (Math.abs(totalPercentage - 100.0) > 0.01) {
                throw new BadRequestException(Constants.INVALID_PERCENTAGE_SUM);
            }

            for (ExpenseShareRequest sr : shareRequests) {
                User user = userService.getUserById(sr.getUserId());
                double pct = sr.getSharePercentage() != null ? sr.getSharePercentage() : 0;
                BigDecimal shareAmount = totalAmount.multiply(BigDecimal.valueOf(pct))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                ExpenseShare share = ExpenseShare.builder()
                        .expense(expense)
                        .user(user)
                        .shareAmount(shareAmount)
                        .sharePercentage(pct)
                        .build();
                shares.add(expenseShareRepository.save(share));
            }
        } else if (splitMethod == SplitMethod.CUSTOM) {
            if (shareRequests == null || shareRequests.isEmpty()) {
                throw new BadRequestException("Share details are required for CUSTOM split");
            }
            BigDecimal shareSum = shareRequests.stream()
                    .map(s -> s.getShareAmount() != null ? s.getShareAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (shareSum.compareTo(totalAmount) != 0) {
                throw new BadRequestException(Constants.INVALID_SHARE_SUM);
            }

            for (ExpenseShareRequest sr : shareRequests) {
                User user = userService.getUserById(sr.getUserId());
                ExpenseShare share = ExpenseShare.builder()
                        .expense(expense)
                        .user(user)
                        .shareAmount(sr.getShareAmount())
                        .build();
                shares.add(expenseShareRepository.save(share));
            }
        }

        return shares;
    }

    private ExpenseResponse mapToExpenseResponse(Expense expense) {
        List<ExpenseShareResponse> shareResponses = expense.getShares().stream()
                .map(share -> ExpenseShareResponse.builder()
                        .userId(share.getUser().getId())
                        .username(share.getUser().getDisplayUsername())
                        .firstName(share.getUser().getFirstName())
                        .lastName(share.getUser().getLastName())
                        .shareAmount(share.getShareAmount())
                        .sharePercentage(share.getSharePercentage())
                        .build())
                .toList();

        return ExpenseResponse.builder()
                .id(expense.getId())
                .groupId(expense.getGroup().getId())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .splitMethod(expense.getSplitMethod())
                .paidByUserId(expense.getPaidBy().getId())
                .paidByName(expense.getPaidBy().getFirstName() + " " + expense.getPaidBy().getLastName())
                .receiptUrl(expense.getReceiptUrl())
                .isRecurringGenerated(expense.getIsRecurringGenerated())
                .shares(shareResponses)
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
