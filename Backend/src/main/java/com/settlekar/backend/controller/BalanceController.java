package com.settlekar.backend.controller;

import com.settlekar.backend.dto.response.BalanceSummaryResponse;
import com.settlekar.backend.dto.response.DebtGraphResponse;
import com.settlekar.backend.dto.response.PairwiseBalanceResponse;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/balances")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;

    @GetMapping
    public ResponseEntity<List<PairwiseBalanceResponse>> getPairwiseBalances(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(balanceService.getPairwiseBalances(groupId, currentUser));
    }

    @GetMapping("/summary")
    public ResponseEntity<List<BalanceSummaryResponse>> getBalanceSummary(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(balanceService.getBalanceSummary(groupId, currentUser));
    }

    @GetMapping("/graph")
    public ResponseEntity<DebtGraphResponse> getDebtGraph(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(balanceService.getDebtGraph(groupId, currentUser));
    }
}
