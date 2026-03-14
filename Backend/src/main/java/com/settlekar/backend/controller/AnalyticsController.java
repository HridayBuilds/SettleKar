package com.settlekar.backend.controller;

import com.settlekar.backend.dto.response.AnalyticsResponse;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/category")
    public ResponseEntity<List<AnalyticsResponse.CategoryBreakdown>> getCategoryBreakdown(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(analyticsService.getCategoryBreakdown(groupId, currentUser));
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<AnalyticsResponse.MonthlyBreakdown>> getMonthlyBreakdown(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(analyticsService.getMonthlyBreakdown(groupId, currentUser));
    }

    @GetMapping("/member")
    public ResponseEntity<List<AnalyticsResponse.MemberBreakdown>> getMemberBreakdown(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(analyticsService.getMemberBreakdown(groupId, currentUser));
    }
}
