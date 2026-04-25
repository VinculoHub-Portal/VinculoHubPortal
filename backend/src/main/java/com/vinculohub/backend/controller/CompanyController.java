/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping("/api/company-accounts")
    public ResponseEntity<CompanyDTO> createCompany(
            @AuthenticationPrincipal Jwt jwt, @RequestBody CompanyDTO companyDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        companyService.createCompany(
                                jwt.getSubject(), jwt.getClaimAsString("email"), companyDTO));
    }
}
