/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.NpoReportCreateRequest;
import com.vinculohub.backend.dto.NpoReportResponse;
import com.vinculohub.backend.dto.NpoReportStatusUpdateRequest;
import com.vinculohub.backend.model.enums.NpoReportStatus;
import com.vinculohub.backend.service.NpoReportService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NpoReportController {

    private final NpoReportService npoReportService;

    @PostMapping("/npos/{npoId}/reports")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<NpoReportResponse> createReport(
            @PathVariable Integer npoId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody NpoReportCreateRequest request) {
        log.info("POST /api/npos/{}/reports | sub={}", npoId, jwt.getSubject());
        NpoReportResponse response =
                npoReportService.createReport(npoId, jwt.getSubject(), request);
        log.info("NPO report created | id={} npoId={}", response.id(), response.npo().id());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/admin/npo-reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<NpoReportResponse>> listReportsForAdmin(
            @RequestParam(required = false) String npoName,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) NpoReportStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
                    Pageable pageable) {
        log.info(
                "GET /api/admin/npo-reports | npoName={} companyName={} status={}",
                npoName,
                companyName,
                status);
        return ResponseEntity.ok(
                npoReportService.listReportsForAdmin(npoName, companyName, status, pageable));
    }

    @PatchMapping("/admin/npo-reports/{reportId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NpoReportResponse> updateReportStatus(
            @PathVariable Long reportId, @Valid @RequestBody NpoReportStatusUpdateRequest request) {
        log.info("PATCH /api/admin/npo-reports/{}/status | status={}", reportId, request.status());
        return ResponseEntity.ok(npoReportService.updateReportStatus(reportId, request));
    }
}
