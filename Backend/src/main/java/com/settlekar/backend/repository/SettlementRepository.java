package com.settlekar.backend.repository;

import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.Settlement;
import com.settlekar.backend.enums.SettlementStatus;
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
public interface SettlementRepository extends JpaRepository<Settlement, UUID> {

    Page<Settlement> findByGroup(Group group, Pageable pageable);

    List<Settlement> findByGroupAndStatus(Group group, SettlementStatus status);

    List<Settlement> findByGroup(Group group);

    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Settlement s WHERE s.group.id = :groupId AND s.payer.id = :userId AND s.status = 'COMPLETED'")
    BigDecimal sumPaidSettlementsByUserInGroup(@Param("groupId") UUID groupId, @Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Settlement s WHERE s.group.id = :groupId AND s.receiver.id = :userId AND s.status = 'COMPLETED'")
    BigDecimal sumReceivedSettlementsByUserInGroup(@Param("groupId") UUID groupId, @Param("userId") UUID userId);
}
