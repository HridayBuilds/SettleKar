package com.settlekar.backend.controller;

import com.settlekar.backend.dto.request.AddMemberRequest;
import com.settlekar.backend.dto.request.CreateGroupRequest;
import com.settlekar.backend.dto.request.UpdateGroupRequest;
import com.settlekar.backend.dto.response.GroupMemberResponse;
import com.settlekar.backend.dto.response.GroupResponse;
import com.settlekar.backend.dto.response.LedgerEntryResponse;
import com.settlekar.backend.dto.response.MessageResponse;
import com.settlekar.backend.entity.User;
import com.settlekar.backend.enums.GroupRole;
import com.settlekar.backend.service.GroupMemberService;
import com.settlekar.backend.service.GroupService;
import com.settlekar.backend.service.TransactionLedgerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final GroupMemberService groupMemberService;
    private final TransactionLedgerService ledgerService;

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.createGroup(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<Page<GroupResponse>> getUserGroups(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(groupService.getUserGroups(currentUser,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupResponse> getGroup(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(groupService.getGroupById(id, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupResponse> updateGroup(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateGroupRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(groupService.updateGroup(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteGroup(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        groupService.deleteGroup(id, currentUser);
        return ResponseEntity.ok(MessageResponse.success("Group deleted successfully"));
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<GroupResponse> lockGroup(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(groupService.lockGroup(id, currentUser));
    }

    @PostMapping("/{id}/extend")
    public ResponseEntity<GroupResponse> extendGroup(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(groupService.extendHostelGroup(id, currentUser));
    }

    @PostMapping("/join/{joinCode}")
    public ResponseEntity<GroupResponse> joinGroupByCode(
            @PathVariable String joinCode,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(groupService.joinGroupByCode(joinCode, currentUser));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<GroupMemberResponse> addMember(
            @PathVariable UUID id,
            @Valid @RequestBody AddMemberRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(groupMemberService.addMember(id, request.getUsername(), currentUser));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<MessageResponse> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal User currentUser) {
        groupMemberService.removeMember(id, userId, currentUser);
        return ResponseEntity.ok(MessageResponse.success("Member removed successfully"));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMemberResponse>> getMembers(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(groupMemberService.getMembers(id, currentUser));
    }

    @PutMapping("/{id}/members/{userId}/role")
    public ResponseEntity<GroupMemberResponse> changeRole(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @RequestParam GroupRole role,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(groupMemberService.changeRole(id, userId, role, currentUser));
    }

    @GetMapping("/{id}/ledger")
    public ResponseEntity<Page<LedgerEntryResponse>> getLedger(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        groupService.getGroupById(id, currentUser); // verify membership
        return ResponseEntity.ok(ledgerService.getLedgerEntries(id,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }
}
