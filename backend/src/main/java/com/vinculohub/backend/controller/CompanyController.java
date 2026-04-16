/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping("/api/company-accounts")
    public ResponseEntity<CompanyDTO> createCompany(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CompanyDTO companyDTO) {
        log.info("POST /api/company-accounts | sub={} email={} cnpj={}",
                jwt.getSubject(), jwt.getClaimAsString("email"), companyDTO.cnpj());
        CompanyDTO created = companyService.createCompany(
                jwt.getSubject(), jwt.getClaimAsString("email"), companyDTO);
        log.info("Company created | id={} legalName={}", created.id(), created.legalName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
