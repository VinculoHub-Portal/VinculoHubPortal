/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.AdminMetricsResponse;
import com.vinculohub.backend.dto.AdminVinculoListItemResponse;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.service.AdminMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMetricsController {

    private final AdminMetricsService adminMetricsService;
    private final CompanyProjectRepository companyProjectRepository;

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsResponse> getMetrics() {
        log.info("GET /api/admin/metrics");
        return ResponseEntity.ok(adminMetricsService.getMetrics());
    }

    @GetMapping("/vinculos")
    public ResponseEntity<Page<AdminVinculoListItemResponse>> listVinculos(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
                    Pageable pageable) {
        log.info("GET /api/admin/vinculos | page={} size={}", pageable.getPageNumber(), pageable.getPageSize());
        Page<AdminVinculoListItemResponse> page =
                companyProjectRepository.findAllForAdmin(pageable).map(AdminVinculoListItemResponse::from);
        return ResponseEntity.ok(page);
    }
}
