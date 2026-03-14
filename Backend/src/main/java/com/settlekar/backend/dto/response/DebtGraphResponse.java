package com.settlekar.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebtGraphResponse {

    private List<NodeDTO> nodes;
    private List<EdgeDTO> edges;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NodeDTO {
        private UUID userId;
        private String name;
        private BigDecimal netBalance;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EdgeDTO {
        private UUID fromUserId;
        private String fromName;
        private UUID toUserId;
        private String toName;
        private BigDecimal amount;
    }
}
