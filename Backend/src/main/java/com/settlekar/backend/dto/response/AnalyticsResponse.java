package com.settlekar.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    private List<CategoryBreakdown> categoryBreakdown;
    private List<MonthlyBreakdown> monthlyBreakdown;
    private List<MemberBreakdown> memberBreakdown;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryBreakdown {
        private String category;
        private BigDecimal totalAmount;
        private Double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyBreakdown {
        private String month;
        private BigDecimal totalAmount;
        private Integer expenseCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MemberBreakdown {
        private String memberName;
        private BigDecimal totalPaid;
        private BigDecimal totalOwed;
    }
}
