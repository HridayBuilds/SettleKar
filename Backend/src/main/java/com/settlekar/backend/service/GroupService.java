package com.settlekar.backend.service;

import com.settlekar.backend.dto.request.CreateGroupRequest;
import com.settlekar.backend.dto.request.UpdateGroupRequest;
import com.settlekar.backend.dto.response.GroupResponse;
import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.GroupMember;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.GroupRole;
import com.settlekar.backend.enums.GroupStatus;
import com.settlekar.backend.enums.GroupType;
import com.settlekar.backend.enums.LedgerEntryType;
import com.settlekar.backend.exception.BadRequestException;
import com.settlekar.backend.exception.GroupLockedException;
import com.settlekar.backend.exception.ResourceNotFoundException;
import com.settlekar.backend.exception.UnauthorizedException;
import com.settlekar.backend.repository.ExpenseRepository;
import com.settlekar.backend.repository.ExpenseShareRepository;
import com.settlekar.backend.repository.GroupMemberRepository;
import com.settlekar.backend.repository.GroupRepository;
import com.settlekar.backend.repository.SettlementRepository;
import com.settlekar.backend.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseShareRepository expenseShareRepository;
    private final SettlementRepository settlementRepository;
    private final TransactionLedgerService ledgerService;

    private static final String JOIN_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int JOIN_CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private String generateUniqueJoinCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(JOIN_CODE_LENGTH);
            for (int i = 0; i < JOIN_CODE_LENGTH; i++) {
                sb.append(JOIN_CODE_CHARS.charAt(RANDOM.nextInt(JOIN_CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (groupRepository.existsByJoinCode(code));
        return code;
    }

    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request, User currentUser) {
        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .status(GroupStatus.ACTIVE)
                .createdBy(currentUser)
                .joinCode(generateUniqueJoinCode())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .durationMonths(request.getDurationMonths())
                .contributionAmount(request.getContributionAmount())
                .budgetCap(request.getBudgetCap())
                .build();

        // Type-specific validation
        if (request.getType() == GroupType.TRAVEL || request.getType() == GroupType.EVENT) {
            if (request.getStartDate() == null || request.getEndDate() == null) {
                throw new BadRequestException("Start date and end date are required for " + request.getType() + " groups");
            }
        }
        if (request.getType() == GroupType.HOSTEL) {
            if (request.getDurationMonths() == null) {
                throw new BadRequestException("Duration in months is required for HOSTEL groups");
            }
            group.setStartDate(LocalDate.now());
            group.setEndDate(LocalDate.now().plusMonths(request.getDurationMonths()));
        }
        if (request.getType() == GroupType.EVENT && request.getBudgetCap() == null) {
            throw new BadRequestException("Budget cap is required for EVENT groups");
        }

        Group savedGroup = groupRepository.save(group);

        // Add creator as admin
        GroupMember adminMember = GroupMember.builder()
                .group(savedGroup)
                .user(currentUser)
                .role(GroupRole.ADMIN)
                .isActive(true)
                .build();
        groupMemberRepository.save(adminMember);

        ledgerService.appendEntry(savedGroup, LedgerEntryType.GROUP_CREATED, currentUser,
                "Group '" + savedGroup.getName() + "' created", savedGroup.getId(), "GROUP", null);

        log.info("Group created: {} by user: {} with join code: {}", savedGroup.getName(), currentUser.getEmail(), savedGroup.getJoinCode());
        return mapToGroupResponse(savedGroup, 1, computeUserBalance(savedGroup.getId(), currentUser.getId()), currentUser);
    }

    @Transactional
    public GroupResponse joinGroupByCode(String joinCode, User currentUser) {
        Group group = groupRepository.findByJoinCode(joinCode.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid join code. No group found."));

        if (group.getStatus() != GroupStatus.ACTIVE) {
            throw new BadRequestException("This group is no longer accepting new members.");
        }

        if (groupMemberRepository.existsByGroupAndUserAndIsActiveTrue(group, currentUser)) {
            throw new BadRequestException(Constants.ALREADY_GROUP_MEMBER);
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(currentUser)
                .role(GroupRole.MEMBER)
                .isActive(true)
                .build();

        groupMemberRepository.save(member);

        ledgerService.appendEntry(group, LedgerEntryType.MEMBER_JOINED, currentUser,
                currentUser.getFirstName() + " joined group '" + group.getName() + "' via join code",
                currentUser.getId(), "USER", null);

        int memberCount = groupMemberRepository.findByGroupAndIsActiveTrue(group).size();
        log.info("User {} joined group {} via join code", currentUser.getEmail(), group.getName());
        return mapToGroupResponse(group, memberCount, computeUserBalance(group.getId(), currentUser.getId()), currentUser);
    }

    public GroupResponse getGroupById(UUID groupId, User currentUser) {
        Group group = findGroupById(groupId);
        verifyMembership(group, currentUser);

        int memberCount = groupMemberRepository.findByGroupAndIsActiveTrue(group).size();
        return mapToGroupResponse(group, memberCount, computeUserBalance(group.getId(), currentUser.getId()), currentUser);
    }

    public Page<GroupResponse> getUserGroups(User currentUser, Pageable pageable) {
        List<GroupMember> memberships = groupMemberRepository.findByUserAndIsActiveTrue(currentUser);
        List<UUID> groupIds = memberships.stream().map(gm -> gm.getGroup().getId()).toList();

        if (groupIds.isEmpty()) {
            return Page.empty(pageable);
        }

        return groupRepository.findByIdIn(groupIds, pageable)
                .map(group -> {
                    int memberCount = groupMemberRepository.findByGroupAndIsActiveTrue(group).size();
                    return mapToGroupResponse(group, memberCount, computeUserBalance(group.getId(), currentUser.getId()), currentUser);
                });
    }

    @Transactional
    public GroupResponse updateGroup(UUID groupId, UpdateGroupRequest request, User currentUser) {
        Group group = findGroupById(groupId);
        verifyAdmin(group, currentUser);

        if (request.getName() != null) {
            group.setName(request.getName());
        }
        if (request.getDescription() != null) {
            group.setDescription(request.getDescription());
        }

        Group updatedGroup = groupRepository.save(group);
        int memberCount = groupMemberRepository.findByGroupAndIsActiveTrue(group).size();
        return mapToGroupResponse(updatedGroup, memberCount, computeUserBalance(updatedGroup.getId(), currentUser.getId()), currentUser);
    }

    @Transactional
    public void deleteGroup(UUID groupId, User currentUser) {
        Group group = findGroupById(groupId);
        verifyAdmin(group, currentUser);
        groupRepository.delete(group);
        log.info("Group deleted: {} by user: {}", group.getName(), currentUser.getEmail());
    }

    @Transactional
    public GroupResponse lockGroup(UUID groupId, User currentUser) {
        Group group = findGroupById(groupId);
        verifyAdmin(group, currentUser);

        group.setStatus(GroupStatus.LOCKED);
        Group lockedGroup = groupRepository.save(group);

        ledgerService.appendEntry(lockedGroup, LedgerEntryType.GROUP_LOCKED, currentUser,
                "Group '" + lockedGroup.getName() + "' locked", lockedGroup.getId(), "GROUP", null);

        int memberCount = groupMemberRepository.findByGroupAndIsActiveTrue(group).size();
        return mapToGroupResponse(lockedGroup, memberCount, computeUserBalance(lockedGroup.getId(), currentUser.getId()), currentUser);
    }

    @Transactional
    public GroupResponse extendHostelGroup(UUID groupId, User currentUser) {
        Group group = findGroupById(groupId);
        verifyAdmin(group, currentUser);

        if (group.getType() != GroupType.HOSTEL) {
            throw new BadRequestException("Only HOSTEL groups can be extended");
        }

        group.setDurationMonths(group.getDurationMonths() + 1);
        group.setEndDate(group.getStartDate().plusMonths(group.getDurationMonths()));

        Group extendedGroup = groupRepository.save(group);
        int memberCount = groupMemberRepository.findByGroupAndIsActiveTrue(group).size();
        return mapToGroupResponse(extendedGroup, memberCount, computeUserBalance(extendedGroup.getId(), currentUser.getId()), currentUser);
    }

    public Group findGroupById(UUID groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.GROUP_NOT_FOUND));
    }

    public void verifyMembership(Group group, User user) {
        if (!groupMemberRepository.existsByGroupAndUserAndIsActiveTrue(group, user)) {
            throw new UnauthorizedException(Constants.NOT_GROUP_MEMBER);
        }
    }

    public void verifyAdmin(Group group, User user) {
        GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new UnauthorizedException(Constants.NOT_GROUP_MEMBER));

        if (member.getRole() != GroupRole.ADMIN || !member.getIsActive()) {
            throw new UnauthorizedException(Constants.NOT_GROUP_ADMIN);
        }
    }

    public void verifyGroupNotLocked(Group group) {
        if (group.getStatus() != GroupStatus.ACTIVE) {
            throw new GroupLockedException(Constants.GROUP_LOCKED);
        }
    }

    private GroupResponse mapToGroupResponse(Group group, int memberCount, BigDecimal currentUserBalance, User currentUser) {
        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .type(group.getType())
                .status(group.getStatus())
                .createdById(group.getCreatedBy().getId())
                .createdByName(group.getCreatedBy().getFirstName() + " " + group.getCreatedBy().getLastName())
                .startDate(group.getStartDate())
                .endDate(group.getEndDate())
                .durationMonths(group.getDurationMonths())
                .contributionAmount(group.getContributionAmount())
                .budgetCap(group.getBudgetCap())
                .joinCode(group.getJoinCode())
                .memberCount(memberCount)
                .currentUserBalance(currentUserBalance)
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }

    private BigDecimal computeUserBalance(UUID groupId, UUID userId) {
        BigDecimal paid = expenseRepository.sumPaidByUserInGroup(groupId, userId);
        BigDecimal owed = expenseShareRepository.sumSharesByUserInGroup(groupId, userId);
        BigDecimal settlementsPaid = settlementRepository.sumPaidSettlementsByUserInGroup(groupId, userId);
        BigDecimal settlementsReceived = settlementRepository.sumReceivedSettlementsByUserInGroup(groupId, userId);
        // balance = (what I paid) - (my share of expenses) - (settlements I paid out) + (settlements I received)
        return paid.subtract(owed).subtract(settlementsPaid).add(settlementsReceived);
    }
}
