/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.dto.CompanyExportDTO;
import com.vinculohub.backend.dto.CompanyListItemResponse;
import com.vinculohub.backend.dto.NpoListItemResponse;
import com.vinculohub.backend.service.CompanyService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @GetMapping("/api/companies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CompanyExportDTO>> listAll() {
        log.info("GET /api/companies");
        return ResponseEntity.ok(companyService.findAllForExport());
    }

    @GetMapping("/api/npo/companies")
    @PreAuthorize("hasRole('NPO')")
    public ResponseEntity<Page<CompanyListItemResponse>> listCompaniesForNpo(
            @PageableDefault(size = 10, sort = "legalName", direction = Sort.Direction.ASC)
                    Pageable pageable) {
        log.info(
                "GET /api/npo/companies | page={} size={}",
                pageable.getPageNumber(),
                pageable.getPageSize());
        return ResponseEntity.ok(companyService.findAllForNpoListing(pageable));
    }

    @GetMapping("/api/company/npos")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Page<NpoListItemResponse>> listNposForCompany(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC)
                    Pageable pageable) {
        log.info(
                "GET /api/company/npos | name={} page={} size={}",
                name,
                pageable.getPageNumber(),
                pageable.getPageSize());
        return ResponseEntity.ok(companyService.findAllForCompanyListing(name, pageable));
    }

    @PostMapping("/api/company-accounts")
    @PreAuthorize("!hasRole('NPO') && !hasRole('ADMIN')")
    public ResponseEntity<CompanyDTO> createCompany(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CompanyDTO companyDTO) {
        log.info(
                "POST /api/company-accounts | sub={} email={} cnpj={}",
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                companyDTO.cnpj());
        CompanyDTO created =
                companyService.createCompany(
                        jwt.getSubject(), jwt.getClaimAsString("email"), companyDTO);
        log.info("Company created | id={} legalName={}", created.id(), created.legalName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
