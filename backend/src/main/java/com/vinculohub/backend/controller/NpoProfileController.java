/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.NpoProfileResponse;
import com.vinculohub.backend.service.NpoProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/npos")
@RequiredArgsConstructor
public class NpoProfileController {

    private final NpoProfileService npoProfileService;

    @GetMapping("/{id}")
    public ResponseEntity<NpoProfileResponse> getProfile(
            @PathVariable Integer id, Authentication authentication) {
        String subject =
                authentication != null && authentication.getPrincipal() instanceof Jwt jwt
                        ? jwt.getSubject()
                        : null;
        return ResponseEntity.ok(npoProfileService.getProfile(id, subject));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NpoProfileResponse> updateProfile(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody NpoProfileResponse.UpdateRequest request) {
        return ResponseEntity.ok(npoProfileService.updateProfile(id, jwt.getSubject(), request));
    }
}
