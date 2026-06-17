/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.VinculoExportDTO;
import com.vinculohub.backend.service.AdminExportService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin/export")
@RequiredArgsConstructor
public class AdminExportController {

    private final AdminExportService adminExportService;

    @GetMapping("/vinculos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VinculoExportDTO>> exportVinculos() {
        log.info("GET /api/admin/export/vinculos");
        return ResponseEntity.ok(adminExportService.findAllVinculosForExport());
    }
}
