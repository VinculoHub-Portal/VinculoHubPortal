/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.dto.ProjectListItemDTO;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.service.ProjectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
            Pageable pageable) {
        log.info(
                "GET /api/projects | npoId={} status={} title={} page={} size={}",
                npoId,
                status,
                title,
                pageable.getPageNumber(),
                pageable.getPageSize());
        Page<ProjectListItemDTO> page =
                projectService.listProjects(new ProjectFilterParams(npoId, status, title), pageable);
        return ResponseEntity.ok(page);
    }
}
