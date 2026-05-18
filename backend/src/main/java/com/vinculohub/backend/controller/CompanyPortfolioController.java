/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CompanyEsgImpactDashboardResponse;
import com.vinculohub.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/me/company/portfolio")
@RequiredArgsConstructor
public class CompanyPortfolioController {

    private final ProjectService projectService;

    @GetMapping("/esg-impact")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanyEsgImpactDashboardResponse> getEsgImpactDashboard(
            @AuthenticationPrincipal Jwt jwt) {
        log.info("GET /api/me/company/portfolio/esg-impact | sub={}", jwt.getSubject());
        CompanyEsgImpactDashboardResponse response =
                projectService.getEsgImpactDashboard(jwt.getSubject());
        return ResponseEntity.ok(response);
    }
}
