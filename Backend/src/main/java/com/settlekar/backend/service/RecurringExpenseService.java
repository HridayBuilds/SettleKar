package com.settlekar.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.settlekar.backend.dto.request.CreateRecurringExpenseRequest;
import com.settlekar.backend.dto.request.ExpenseShareRequest;
import com.settlekar.backend.dto.response.RecurringExpenseResponse;
import com.settlekar.backend.entity.*;
import com.settlekar.backend.enums.LedgerEntryType;
import com.settlekar.backend.exception.ResourceNotFoundException;
import com.settlekar.backend.repository.ExpenseRepository;
import com.settlekar.backend.repository.RecurringExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringExpenseService {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseRepository expenseRepository;
    private final GroupService groupService;
    private final UserService userService;
    private final ExpenseService expenseService;
    private final TransactionLedgerService ledgerService;
    private final ObjectMapper objectMapper;

    @Transactional
    public RecurringExpenseResponse createRecurring(UUID groupId, CreateRecurringExpenseRequest request, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);
        groupService.verifyGroupNotLocked(group);

        User payer = userService.getUserById(request.getPaidByUserId());

        String participantData = null;
        if (request.getShares() != null) {
            try {
                participantData = objectMapper.writeValueAsString(request.getShares());
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize participant data", e);
            }
        }

        RecurringExpense recurring = RecurringExpense.builder()
                .group(group)
                .description(request.getDescription())
                .amount(request.getAmount())
                .category(request.getCategory())
                .splitMethod(request.getSplitMethod())
                .paidBy(payer)
                .participantData(participantData)
                .frequencyDays(request.getFrequencyDays() != null ? request.getFrequencyDays() : 30)
                .nextDueDate(request.getNextDueDate())
                .isActive(true)
                .build();

        RecurringExpense saved = recurringExpenseRepository.save(recurring);
        log.info("Recurring expense created: {} in group {}", request.getDescription(), group.getName());
        return mapToResponse(saved);
    }

    public List<RecurringExpenseResponse> getRecurring(UUID groupId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);
        return recurringExpenseRepository.findByGroupAndIsActiveTrue(group).stream()
                .map(this::mapToResponse).toList();
    }

    @Transactional
    public RecurringExpenseResponse updateRecurring(UUID groupId, UUID recurringId,
                                                     CreateRecurringExpenseRequest request, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);

        RecurringExpense recurring = recurringExpenseRepository.findById(recurringId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring expense not found"));

        recurring.setDescription(request.getDescription());
        recurring.setAmount(request.getAmount());
        recurring.setCategory(request.getCategory());
        recurring.setSplitMethod(request.getSplitMethod());
        recurring.setPaidBy(userService.getUserById(request.getPaidByUserId()));
        if (request.getFrequencyDays() != null) recurring.setFrequencyDays(request.getFrequencyDays());
        recurring.setNextDueDate(request.getNextDueDate());

        if (request.getShares() != null) {
            try {
                recurring.setParticipantData(objectMapper.writeValueAsString(request.getShares()));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize participant data", e);
            }
        }

        return mapToResponse(recurringExpenseRepository.save(recurring));
    }

    @Transactional
    public void deactivateRecurring(UUID groupId, UUID recurringId, User currentUser) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, currentUser);

        RecurringExpense recurring = recurringExpenseRepository.findById(recurringId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring expense not found"));

        recurring.setIsActive(false);
        recurringExpenseRepository.save(recurring);
    }

    @Transactional
    public void processRecurringExpenses() {
        List<RecurringExpense> dueExpenses = recurringExpenseRepository
                .findByIsActiveTrueAndNextDueDateLessThanEqual(LocalDate.now());

        for (RecurringExpense recurring : dueExpenses) {
            try {
                Expense expense = Expense.builder()
                        .group(recurring.getGroup())
                        .description(recurring.getDescription())
                        .amount(recurring.getAmount())
                        .category(recurring.getCategory())
                        .splitMethod(recurring.getSplitMethod())
                        .paidBy(recurring.getPaidBy())
                        .isRecurringGenerated(true)
                        .recurringExpenseId(recurring.getId())
                        .build();

                expenseRepository.save(expense);

                // Parse and create shares if participant data exists
                if (recurring.getParticipantData() != null) {
                    List<ExpenseShareRequest> shares = objectMapper.readValue(
                            recurring.getParticipantData(), new TypeReference<>() {});
                    // Shares will be created by the expense computation logic
                }

                recurring.setLastGeneratedDate(LocalDate.now());
                recurring.setNextDueDate(LocalDate.now().plusDays(recurring.getFrequencyDays()));
                recurringExpenseRepository.save(recurring);

                ledgerService.appendEntry(recurring.getGroup(), LedgerEntryType.RECURRING_EXPENSE_GENERATED,
                        recurring.getPaidBy(), "Recurring expense '" + recurring.getDescription() + "' generated",
                        expense.getId(), "EXPENSE", null);

                log.info("Recurring expense generated: {}", recurring.getDescription());
            } catch (Exception e) {
                log.error("Failed to process recurring expense: {}", recurring.getId(), e);
            }
        }
    }

    private RecurringExpenseResponse mapToResponse(RecurringExpense recurring) {
        return RecurringExpenseResponse.builder()
                .id(recurring.getId())
                .groupId(recurring.getGroup().getId())
                .description(recurring.getDescription())
                .amount(recurring.getAmount())
                .category(recurring.getCategory())
                .splitMethod(recurring.getSplitMethod())
                .paidByUserId(recurring.getPaidBy().getId())
                .paidByName(recurring.getPaidBy().getFirstName() + " " + recurring.getPaidBy().getLastName())
                .frequencyDays(recurring.getFrequencyDays())
                .nextDueDate(recurring.getNextDueDate())
                .lastGeneratedDate(recurring.getLastGeneratedDate())
                .isActive(recurring.getIsActive())
                .createdAt(recurring.getCreatedAt())
                .build();
    }
}
