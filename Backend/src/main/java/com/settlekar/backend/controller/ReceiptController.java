package com.settlekar.backend.controller;

import com.settlekar.backend.dto.response.ReceiptScanResponse;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.service.ReceiptScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptScanService receiptScanService;

    @PostMapping("/scan")
    public ResponseEntity<ReceiptScanResponse> scanReceipt(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(receiptScanService.scanReceipt(file));
    }
}
