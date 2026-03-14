package com.settlekar.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDetailResponse {

    private GroupResponse group;
    private List<GroupMemberResponse> members;
    private List<ExpenseResponse> recentExpenses;
}
