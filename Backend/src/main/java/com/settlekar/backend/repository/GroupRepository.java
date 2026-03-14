package com.settlekar.backend.repository;

import com.settlekar.backend.entity.Group;
import com.settlekar.backend.enums.GroupStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupRepository extends JpaRepository<Group, UUID> {

    Page<Group> findByIdIn(List<UUID> ids, Pageable pageable);

    List<Group> findByStatusAndEndDateBefore(GroupStatus status, LocalDate date);

    List<Group> findByStatus(GroupStatus status);

    Optional<Group> findByJoinCode(String joinCode);

    boolean existsByJoinCode(String joinCode);
}
