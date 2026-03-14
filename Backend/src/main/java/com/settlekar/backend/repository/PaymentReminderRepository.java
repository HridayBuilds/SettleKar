package com.settlekar.backend.repository;

import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.PaymentReminder;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.ReminderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentReminderRepository extends JpaRepository<PaymentReminder, UUID> {

    Boolean existsByDebtorAndCreditorAndGroupAndReminderType(User debtor, User creditor, Group group, ReminderType reminderType);

    Optional<PaymentReminder> findTopByDebtorAndCreditorAndGroupAndReminderTypeOrderBySentAtDesc(
            User debtor, User creditor, Group group, ReminderType reminderType);
}
