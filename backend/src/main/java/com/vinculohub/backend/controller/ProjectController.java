/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.ProjectCreateRequest;
import com.vinculohub.backend.dto.ProjectCreateResponse;
import com.vinculohub.backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping("/api/projects")
    @PreAuthorize("hasRole('NPO')")
    public ResponseEntity<ProjectCreateResponse> createProject(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProjectCreateRequest request) {
        log.info("POST /api/projects | sub={} title={}", jwt.getSubject(), request.title());
        ProjectCreateResponse response = projectService.createProject(jwt.getSubject(), request);
        log.info("Project created | id={} npoId={}", response.id(), response.npoId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
