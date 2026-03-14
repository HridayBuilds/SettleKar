package com.settlekar.backend.dto.response;

import com.settlekar.backend.enums.ExpenseCategory;
import com.settlekar.backend.enums.SplitMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringExpenseResponse {

    private UUID id;
    private UUID groupId;
    private String description;
    private BigDecimal amount;
    private ExpenseCategory category;
    private SplitMethod splitMethod;
    private UUID paidByUserId;
    private String paidByName;
    private Integer frequencyDays;
    private LocalDate nextDueDate;
    private LocalDate lastGeneratedDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
