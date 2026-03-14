package com.settlekar.backend.repository;

import com.settlekar.backend.entity.Expense;
import com.settlekar.backend.entity.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    Page<Expense> findByGroup(Group group, Pageable pageable);

    List<Expense> findByGroup(Group group);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.group.id = :groupId")
    BigDecimal sumAmountByGroupId(@Param("groupId") UUID groupId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.group.id = :groupId AND e.paidBy.id = :userId")
    BigDecimal sumPaidByUserInGroup(@Param("groupId") UUID groupId, @Param("userId") UUID userId);
}
