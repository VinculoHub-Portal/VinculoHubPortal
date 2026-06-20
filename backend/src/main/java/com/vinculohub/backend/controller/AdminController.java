/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.AdminNpoCardResponse;
import com.vinculohub.backend.dto.AdminRelationshipResponse;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.service.AdminNpoService;
import com.vinculohub.backend.service.AdminRelationshipService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminNpoService adminNpoService;
    private final AdminRelationshipService adminRelationshipService;

    @GetMapping("/ongs")
    public ResponseEntity<Page<AdminNpoCardResponse>> listNpos(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC)
                    Pageable pageable) {
        log.info("GET /api/admin/ongs | search={} area={} active={}", search, area, active);
        return ResponseEntity.ok(adminNpoService.listNpos(search, area, active, pageable));
    }

    @GetMapping("/vinculos/search")
    public ResponseEntity<Page<AdminRelationshipResponse>> listRelationships(
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String npoName,
            @RequestParam(required = false) String projectTitle,
            @RequestParam(required = false) RelationshipStatus status,
            @PageableDefault(size = 10, sort = "updatedAt", direction = Sort.Direction.DESC)
                    Pageable pageable) {
        log.info(
                "GET /api/admin/vinculos/search | companyName={} npoName={} projectTitle={} status={}",
                companyName,
                npoName,
                projectTitle,
                status);
        return ResponseEntity.ok(
                adminRelationshipService.listRelationships(
                        companyName, npoName, projectTitle, status, pageable));
    }
}
