/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.dto.ProjectListItemDTO;
import com.vinculohub.backend.dto.ProjectDetailResponse;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.service.ProjectService;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDetailResponse> getById(@PathVariable Long id) {
        log.info("GET /api/projects/{}", id);
        Project project = projectService.findById(id);
        return ResponseEntity.ok(toResponse(project));
    }

    private static ProjectDetailResponse toResponse(Project project) {
        return new ProjectDetailResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getStatus().name(),
                project.getBudgetNeeded(),
                project.getInvestedAmount(),
                project.getOdsCodes(),
                project.getStartDate(),
                project.getEndDate());
    }
}
