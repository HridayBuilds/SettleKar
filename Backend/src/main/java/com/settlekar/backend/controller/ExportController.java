package com.settlekar.backend.controller;

import com.settlekar.backend.entity.User;
import com.settlekar.backend.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User currentUser) {
        ExportService.CsvExportResult result = exportService.exportGroupExpensesCsv(groupId, currentUser);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.fileName() + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(result.data());
    }
}
