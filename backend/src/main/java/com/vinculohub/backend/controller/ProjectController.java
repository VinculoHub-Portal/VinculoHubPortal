/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.NewProjectRequest;
import com.vinculohub.backend.dto.NewProjectResponse;
import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.dto.ProjectListItemDTO;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.service.ProjectService;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<Page<ProjectListItemDTO>> listProjects(
            @RequestParam(required = false) Long npoId,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Set<Integer> odsCodes,
            @RequestParam(required = false) ProjectType type,
            Pageable pageable) {
        log.info(
                "GET /api/projects | npoId={} status={} title={} odsCodes={} type={} page={}"
                        + " size={}",
                npoId,
                status,
                title,
                odsCodes,
                type,
                pageable.getPageNumber(),
                pageable.getPageSize());
        Page<ProjectListItemDTO> page =
                projectService.listProjects(
                        new ProjectFilterParams(npoId, status, title, odsCodes, type), pageable);
        return ResponseEntity.ok(page);
    }

    @PostMapping
    @PreAuthorize("hasRole('NPO')")
    public ResponseEntity<NewProjectResponse> createProject(
            @AuthenticationPrincipal Jwt jwt, @RequestBody NewProjectRequest request) {
        log.info("POST /api/projects | sub={}", jwt.getSubject());
        NewProjectResponse response =
                projectService.createNewProjectForAuthenticatedNpo(jwt.getSubject(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
