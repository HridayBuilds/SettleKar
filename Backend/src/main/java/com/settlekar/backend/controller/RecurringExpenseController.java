package com.settlekar.backend.controller;

import com.settlekar.backend.dto.request.CreateRecurringExpenseRequest;
import com.settlekar.backend.dto.response.MessageResponse;
import com.settlekar.backend.dto.response.RecurringExpenseResponse;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.service.RecurringExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/recurring")
@RequiredArgsConstructor
public class RecurringExpenseController {

    private final RecurringExpenseService recurringExpenseService;

    @PostMapping
    public ResponseEntity<RecurringExpenseResponse> createRecurring(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateRecurringExpenseRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recurringExpenseService.createRecurring(groupId, request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<RecurringExpenseResponse>> getRecurring(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(recurringExpenseService.getRecurring(groupId, currentUser));
    }

    @PutMapping("/{recurringId}")
    public ResponseEntity<RecurringExpenseResponse> updateRecurring(
            @PathVariable UUID groupId,
            @PathVariable UUID recurringId,
            @Valid @RequestBody CreateRecurringExpenseRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(recurringExpenseService.updateRecurring(groupId, recurringId, request, currentUser));
    }

    @DeleteMapping("/{recurringId}")
    public ResponseEntity<MessageResponse> deactivateRecurring(
            @PathVariable UUID groupId,
            @PathVariable UUID recurringId,
            @AuthenticationPrincipal User currentUser) {
        recurringExpenseService.deactivateRecurring(groupId, recurringId, currentUser);
        return ResponseEntity.ok(MessageResponse.success("Recurring expense deactivated"));
    }
}
