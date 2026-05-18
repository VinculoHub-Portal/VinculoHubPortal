/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CompanySupportedProjectsSummaryResponse;
import com.vinculohub.backend.service.CompanyPortfolioService;
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
@RequestMapping("/api/company/portfolio")
@RequiredArgsConstructor
public class CompanyPortfolioController {

    private final CompanyPortfolioService companyPortfolioService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanySupportedProjectsSummaryResponse> getSupportedProjectsSummary(
            @AuthenticationPrincipal Jwt jwt) {
        log.info("GET /api/company/portfolio/summary | sub={}", jwt.getSubject());

        CompanySupportedProjectsSummaryResponse response =
                companyPortfolioService.getSupportedProjectsSummary(jwt.getSubject());

        return ResponseEntity.ok(response);
    }
}
