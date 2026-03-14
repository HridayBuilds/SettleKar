package com.settlekar.backend.service;

import com.settlekar.backend.dto.response.GroupMemberResponse;
import com.settlekar.backend.entity.Group;
import com.settlekar.backend.entity.GroupMember;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.GroupRole;
import com.settlekar.backend.enums.LedgerEntryType;
import com.settlekar.backend.exception.BadRequestException;
import com.settlekar.backend.exception.ResourceNotFoundException;
import com.settlekar.backend.repository.GroupMemberRepository;
import com.settlekar.backend.repository.UserRepository;
import com.settlekar.backend.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupMemberService {

    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final GroupService groupService;
    private final TransactionLedgerService ledgerService;

    @Transactional
    public GroupMemberResponse addMember(UUID groupId, String username, User requestor) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyAdmin(group, requestor);
        groupService.verifyGroupNotLocked(group);

        User userToAdd = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.USER_NOT_FOUND));

        if (groupMemberRepository.existsByGroupAndUserAndIsActiveTrue(group, userToAdd)) {
            throw new BadRequestException(Constants.ALREADY_GROUP_MEMBER);
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(userToAdd)
                .role(GroupRole.MEMBER)
                .isActive(true)
                .build();

        GroupMember savedMember = groupMemberRepository.save(member);

        ledgerService.appendEntry(group, LedgerEntryType.MEMBER_JOINED, requestor,
                userToAdd.getFirstName() + " joined group '" + group.getName() + "'",
                userToAdd.getId(), "USER", null);

        log.info("Member {} added to group {}", username, group.getName());
        return mapToMemberResponse(savedMember);
    }

    @Transactional
    public void removeMember(UUID groupId, UUID userId, User requestor) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyAdmin(group, requestor);

        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.USER_NOT_FOUND));

        GroupMember member = groupMemberRepository.findByGroupAndUser(group, userToRemove)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.NOT_GROUP_MEMBER));

        member.setIsActive(false);
        member.setLeftAt(LocalDateTime.now());
        groupMemberRepository.save(member);

        ledgerService.appendEntry(group, LedgerEntryType.MEMBER_LEFT, requestor,
                userToRemove.getFirstName() + " removed from group '" + group.getName() + "'",
                userToRemove.getId(), "USER", null);

        log.info("Member {} removed from group {}", userId, group.getName());
    }

    public List<GroupMemberResponse> getMembers(UUID groupId, User requestor) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyMembership(group, requestor);

        return groupMemberRepository.findByGroupAndIsActiveTrue(group).stream()
                .map(this::mapToMemberResponse)
                .toList();
    }

    @Transactional
    public GroupMemberResponse changeRole(UUID groupId, UUID userId, GroupRole newRole, User requestor) {
        Group group = groupService.findGroupById(groupId);
        groupService.verifyAdmin(group, requestor);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.USER_NOT_FOUND));

        GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.NOT_GROUP_MEMBER));

        member.setRole(newRole);
        GroupMember updatedMember = groupMemberRepository.save(member);
        return mapToMemberResponse(updatedMember);
    }

    private GroupMemberResponse mapToMemberResponse(GroupMember member) {
        User user = member.getUser();
        return GroupMemberResponse.builder()
                .userId(user.getId())
                .username(user.getDisplayUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
