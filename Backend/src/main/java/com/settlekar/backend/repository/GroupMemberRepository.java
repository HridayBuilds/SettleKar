package com.settlekar.backend.repository;

import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.GroupMember;
import com.settlekar.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, UUID> {

    Optional<GroupMember> findByGroupAndUser(Group group, User user);

    List<GroupMember> findByGroupAndIsActiveTrue(Group group);

    List<GroupMember> findByUserAndIsActiveTrue(User user);

    Boolean existsByGroupAndUserAndIsActiveTrue(Group group, User user);
}
