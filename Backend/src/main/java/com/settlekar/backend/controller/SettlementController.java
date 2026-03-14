package com.settlekar.backend.controller;

import com.settlekar.backend.dto.request.CreateSettlementRequest;
import com.settlekar.backend.dto.response.SettlementResponse;
import com.settlekar.backend.dto.response.SettlementSuggestionResponse;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @GetMapping("/optimize")
    public ResponseEntity<List<SettlementSuggestionResponse>> optimizeSettlements(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(settlementService.optimizeSettlements(groupId, currentUser));
    }

    @PostMapping
    public ResponseEntity<SettlementResponse> createSettlement(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateSettlementRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(settlementService.createSettlement(groupId, request, currentUser));
    }

    @GetMapping
    public ResponseEntity<Page<SettlementResponse>> getSettlements(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(settlementService.getSettlements(groupId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")), currentUser));
    }

    @PutMapping("/{settlementId}/confirm")
    public ResponseEntity<SettlementResponse> confirmSettlement(
            @PathVariable UUID groupId,
            @PathVariable UUID settlementId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(settlementService.confirmSettlement(groupId, settlementId, currentUser));
    }
}
