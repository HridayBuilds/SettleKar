package com.settlekar.backend.repository;

import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.TransactionLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionLedgerRepository extends JpaRepository<TransactionLedger, UUID> {

    Page<TransactionLedger> findByGroup(Group group, Pageable pageable);

    List<TransactionLedger> findByGroupOrderByCreatedAtDesc(Group group);
}
