package com.settlekar.backend.service;

import com.settlekar.backend.dto.response.LedgerEntryResponse;
import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.TransactionLedger;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.LedgerEntryType;
import com.settlekar.backend.repository.TransactionLedgerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionLedgerService {

    private final TransactionLedgerRepository transactionLedgerRepository;

    @Transactional
    public void appendEntry(Group group, LedgerEntryType entryType, User performedBy,
                            String description, UUID referenceId, String referenceType, String metadata) {
        TransactionLedger entry = TransactionLedger.builder()
                .group(group)
                .entryType(entryType)
                .performedBy(performedBy)
                .description(description)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .metadata(metadata)
                .build();

        transactionLedgerRepository.save(entry);
        log.debug("Ledger entry appended: {} for group {}", entryType, group.getId());
    }

    public Page<LedgerEntryResponse> getLedgerEntries(UUID groupId, Pageable pageable) {
        return transactionLedgerRepository.findByGroup(
                Group.builder().id(groupId).build(), pageable
        ).map(this::mapToResponse);
    }

    private LedgerEntryResponse mapToResponse(TransactionLedger entry) {
        return LedgerEntryResponse.builder()
                .id(entry.getId())
                .entryType(entry.getEntryType())
                .description(entry.getDescription())
                .performedByName(entry.getPerformedBy().getFirstName() + " " +
                        entry.getPerformedBy().getLastName())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
