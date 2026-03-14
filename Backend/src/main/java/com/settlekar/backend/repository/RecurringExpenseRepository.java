package com.settlekar.backend.repository;

import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, UUID> {

    List<RecurringExpense> findByGroupAndIsActiveTrue(Group group);

    List<RecurringExpense> findByIsActiveTrueAndNextDueDateLessThanEqual(LocalDate date);
}
