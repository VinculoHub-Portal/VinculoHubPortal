/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.OdsResponse;
import com.vinculohub.backend.dto.ProjectCreateRequest;
import com.vinculohub.backend.dto.ProjectCreateResponse;
import com.vinculohub.backend.dto.ProjectDetailResponse;
import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.dto.ProjectListItemDTO;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.service.ProjectService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasRole('NPO')")
    public ResponseEntity<ProjectCreateResponse> createProject(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProjectCreateRequest request) {
        log.info("POST /api/projects | sub={} title={}", jwt.getSubject(), request.title());
        ProjectCreateResponse response = projectService.createProject(jwt.getSubject(), request);
        log.info("Project created | id={} npoId={}", response.id(), response.npoId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('NPO')")
    public ResponseEntity<Void> deleteProject(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        log.info("DELETE /api/projects/{}", id);
        projectService.deleteProject(jwt.getSubject(), id);
        return ResponseEntity.noContent().build();
    }

    private static ProjectDetailResponse toResponse(Project project) {
        List<OdsResponse> ods =
                project.getOds() == null
                        ? List.of()
                        : project.getOds().stream()
                                .map(
                                        o ->
                                                new OdsResponse(
                                                        o.getId(), o.getName(), o.getDescription()))
                                .toList();
        return new ProjectDetailResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getStatus().name(),
                project.getType(),
                project.getBudgetNeeded(),
                project.getInvestedAmount(),
                ods,
                project.getStartDate(),
                project.getEndDate(),
                project.getFocusArea(),
                project.getFundraisingDeadline(),
                project.getBeneficiariesCount(),
                project.getLocation(),
                project.getMainObjective());
    }
}
