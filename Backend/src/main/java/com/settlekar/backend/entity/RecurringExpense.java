package com.settlekar.backend.entity;

import com.settlekar.backend.enums.ExpenseCategory;
import com.settlekar.backend.enums.SplitMethod;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "recurring_expenses", indexes = {
        @Index(name = "idx_recurring_group", columnList = "group_id"),
        @Index(name = "idx_recurring_next_due", columnList = "next_due_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @NotBlank
    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @NotNull
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private ExpenseCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "split_method", nullable = false, length = 20)
    private SplitMethod splitMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by", nullable = false)
    private User paidBy;

    @Column(name = "participant_data", columnDefinition = "TEXT")
    private String participantData;

    @Column(name = "frequency_days", nullable = false)
    @Builder.Default
    private Integer frequencyDays = 30;

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @Column(name = "last_generated_date")
    private LocalDate lastGeneratedDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
