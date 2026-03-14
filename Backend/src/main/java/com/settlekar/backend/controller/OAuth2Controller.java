package com.settlekar.backend.controller;

import com.settlekar.backend.dto.response.MessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oauth2")
@RequiredArgsConstructor
@Slf4j
public class OAuth2Controller {

    /**
     * OAuth2 callback endpoint (handled by OAuth2AuthenticationSuccessHandler)
     * This is here for documentation purposes
     * Actual OAuth2 flow is handled by Spring Security
     */
    @GetMapping("/status")
    public ResponseEntity<MessageResponse> oauth2Status() {
        return ResponseEntity.ok(new MessageResponse("OAuth2 integration active"));
    }

}