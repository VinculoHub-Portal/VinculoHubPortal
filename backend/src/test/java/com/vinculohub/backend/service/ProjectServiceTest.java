/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.dto.NpoFirstProjectSignupRequest;
import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.dto.ProjectListItemDTO;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.repository.ProjectRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;

    @Mock private OdsMapper odsMapper;

    @InjectMocks private ProjectService projectService;

    @Test
    void shouldCreateFirstProjectWithMappedFields() {
        Npo npo = Npo.builder().id(20).name("ONG Exemplo").build();

        NpoFirstProjectSignupRequest request =
                new NpoFirstProjectSignupRequest(
                        "Projeto Inicial",
                        "Descrição do projeto inicial",
                        new BigDecimal("1000.00"),
                        List.of("1", "2"));

        when(odsMapper.normalizeCodes(List.of("1", "2"))).thenReturn(Set.of(1, 2));

        when(projectRepository.save(any(Project.class)))
                .thenAnswer(
                        invocation -> {
                            Project project = invocation.getArgument(0);
                            project.setId(30L);
                            return project;
                        });

        Project savedProject = projectService.createFirstProject(npo, request);

        assertEquals(30L, savedProject.getId());
        assertNotNull(savedProject.getNpo());
        assertEquals(20, savedProject.getNpo().getId());
        assertEquals("Projeto Inicial", savedProject.getTitle());
        assertEquals("Descrição do projeto inicial", savedProject.getDescription());
        assertEquals(new BigDecimal("1000.00"), savedProject.getBudgetNeeded());
        assertEquals(Set.of(1, 2), savedProject.getOdsCodes());

        verify(odsMapper).normalizeCodes(List.of("1", "2"));
    }

    @Test
    void shouldReturnPagedProjectList() {
        Npo npo = Npo.builder().id(1).name("ONG Teste").phone("(11) 9999-0000").build();
        Project project =
                Project.builder()
                        .id(1L)
                        .title("Projeto Teste")
                        .status(ProjectStatus.ACTIVE)
                        .npo(npo)
                        .build();
        Pageable pageable = PageRequest.of(0, 20);
        Page<Project> projectPage = new PageImpl<>(List.of(project), pageable, 1);

        when(projectRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(projectPage);

        Page<ProjectListItemDTO> result =
                projectService.listProjects(
                        new ProjectFilterParams(null, null, null, null, null), pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Projeto Teste", result.getContent().get(0).title());
        assertEquals(ProjectStatus.ACTIVE, result.getContent().get(0).status());
        assertEquals("ONG Teste", result.getContent().get(0).npoName());
    }

    @Test
    void shouldReturnEmptyPageWhenNoProjectsFound() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Project> emptyPage = new PageImpl<>(List.of(), pageable, 0);

        when(projectRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(emptyPage);

        Page<ProjectListItemDTO> result =
                projectService.listProjects(
                        new ProjectFilterParams(999L, null, null, null, null), pageable);

        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
    }

    @Test
    void shouldFilterByProjectType() {
        Npo npo = Npo.builder().id(1).name("ONG Teste").phone("(11) 9999-0000").build();
        Project project =
                Project.builder()
                        .id(1L)
                        .title("Projeto Lei de Incentivo")
                        .status(ProjectStatus.ACTIVE)
                        .type(ProjectType.TAX_INCENTIVE_LAW)
                        .npo(npo)
                        .build();
        Pageable pageable = PageRequest.of(0, 20);
        Page<Project> projectPage = new PageImpl<>(List.of(project), pageable, 1);

        when(projectRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(projectPage);

        Page<ProjectListItemDTO> result =
                projectService.listProjects(
                        new ProjectFilterParams(
                                null, null, null, null, ProjectType.TAX_INCENTIVE_LAW),
                        pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Projeto Lei de Incentivo", result.getContent().get(0).title());
    }

    @Test
    void shouldPropagateDataAccessExceptionFromRepository() {
        Pageable pageable = PageRequest.of(0, 20);

        when(projectRepository.findAll(any(Specification.class), eq(pageable)))
                .thenThrow(new DataAccessResourceFailureException("DB error"));

        assertThrows(
                DataAccessException.class,
                () ->
                        projectService.listProjects(
                                new ProjectFilterParams(null, null, null, null, null), pageable));
    }

    @Test
    void shouldReturnProjectWhenFoundById() {
        Project project = Project.builder().id(1L).title("Projeto Teste").build();
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        Project result = projectService.findById(1L);

        assertEquals(1L, result.getId());
        assertEquals("Projeto Teste", result.getTitle());
    }

    @Test
    void shouldThrowNotFoundExceptionWhenProjectDoesNotExist() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> projectService.findById(99L));
    }
}
