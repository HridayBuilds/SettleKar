package com.settlekar.backend.entity;

import com.settlekar.backend.enums.LedgerEntryType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transaction_ledger", indexes = {
        @Index(name = "idx_ledger_group", columnList = "group_id"),
        @Index(name = "idx_ledger_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false, updatable = false)
    private Group group;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false, updatable = false, length = 40)
    private LedgerEntryType entryType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by", nullable = false, updatable = false)
    private User performedBy;

    @Column(name = "description", nullable = false, updatable = false, length = 1000)
    private String description;

    @Column(name = "metadata", updatable = false, columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "reference_id", updatable = false)
    private UUID referenceId;

    @Column(name = "reference_type", updatable = false, length = 20)
    private String referenceType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
