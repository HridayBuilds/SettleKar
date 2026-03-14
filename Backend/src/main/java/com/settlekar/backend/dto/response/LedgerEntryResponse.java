package com.settlekar.backend.dto.response;

import com.settlekar.backend.enums.LedgerEntryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerEntryResponse {

    private UUID id;
    private LedgerEntryType entryType;
    private String description;
    private String performedByName;
    private LocalDateTime createdAt;
}
