package com.settlekar.backend.dto.request;

import com.settlekar.backend.enums.ExpenseCategory;
import com.settlekar.backend.enums.SplitMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExpenseRequest {

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Category is required")
    private ExpenseCategory category;

    @NotNull(message = "Split method is required")
    private SplitMethod splitMethod;

    @NotNull(message = "Payer user ID is required")
    private UUID paidByUserId;

    private List<ExpenseShareRequest> shares;
}
