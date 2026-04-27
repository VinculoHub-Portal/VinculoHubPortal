/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.ProjectSummaryDTO;
import com.vinculohub.backend.model.enums.ProjectStatusFilter;
import com.vinculohub.backend.service.ProjectListingService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectListingService projectListingService;

    public ProjectController(ProjectListingService projectListingService) {
        this.projectListingService = projectListingService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectSummaryDTO>> list(
            @AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) String status) {
        log.info("GET /api/projects | sub={} status={}", jwt.getSubject(), status);
        ProjectStatusFilter filter = ProjectStatusFilter.fromString(status);
        List<ProjectSummaryDTO> result =
                projectListingService.listProjectsForCurrentUser(jwt.getSubject(), filter);
        log.info("GET /api/projects | sub={} returned {} items", jwt.getSubject(), result.size());
        return ResponseEntity.ok(result);
    }
}
