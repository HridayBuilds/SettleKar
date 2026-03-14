package com.settlekar.backend.repository;

import com.settlekar.backend.entity.Expense;
import com.settlekar.backend.entity.ExpenseShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseShareRepository extends JpaRepository<ExpenseShare, UUID> {

    List<ExpenseShare> findByExpense(Expense expense);

    List<ExpenseShare> findByUserIdAndExpenseGroupId(UUID userId, UUID groupId);

    @Query("SELECT COALESCE(SUM(es.shareAmount), 0) FROM ExpenseShare es WHERE es.expense.group.id = :groupId AND es.user.id = :userId")
    BigDecimal sumSharesByUserInGroup(@Param("groupId") UUID groupId, @Param("userId") UUID userId);
}
