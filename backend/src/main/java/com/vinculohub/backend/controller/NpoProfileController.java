/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.NpoProfileResponse;
import com.vinculohub.backend.service.NpoProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/npos")
@RequiredArgsConstructor
public class NpoProfileController {

    private final NpoProfileService npoProfileService;

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NpoProfileResponse> getProfile(
            @PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(npoProfileService.getProfile(id, jwt.getSubject()));
    }
}
