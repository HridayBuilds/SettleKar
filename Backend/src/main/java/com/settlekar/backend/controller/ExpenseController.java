package com.settlekar.backend.controller;

import com.settlekar.backend.dto.request.CreateExpenseRequest;
import com.settlekar.backend.dto.request.UpdateExpenseRequest;
import com.settlekar.backend.dto.response.ExpenseResponse;
import com.settlekar.backend.dto.response.MessageResponse;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateExpenseRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createExpense(groupId, request, currentUser));
    }

    @GetMapping
    public ResponseEntity<Page<ExpenseResponse>> getExpenses(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        return ResponseEntity.ok(expenseService.getExpenses(groupId,
                PageRequest.of(page, size, sort), currentUser));
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> getExpense(
            @PathVariable UUID groupId,
            @PathVariable UUID expenseId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(expenseService.getExpenseById(groupId, expenseId, currentUser));
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable UUID groupId,
            @PathVariable UUID expenseId,
            @Valid @RequestBody UpdateExpenseRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(expenseService.updateExpense(groupId, expenseId, request, currentUser));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<MessageResponse> deleteExpense(
            @PathVariable UUID groupId,
            @PathVariable UUID expenseId,
            @AuthenticationPrincipal User currentUser) {
        expenseService.deleteExpense(groupId, expenseId, currentUser);
        return ResponseEntity.ok(MessageResponse.success("Expense deleted successfully"));
    }

    @PostMapping("/{expenseId}/receipt")
    public ResponseEntity<ExpenseResponse> uploadReceipt(
            @PathVariable UUID groupId,
            @PathVariable UUID expenseId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(expenseService.uploadReceipt(groupId, expenseId, file, currentUser));
    }
}
