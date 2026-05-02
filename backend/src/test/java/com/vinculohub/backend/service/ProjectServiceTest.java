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
import com.vinculohub.backend.dto.OdsResponse;
import com.vinculohub.backend.dto.ProjectCreateRequest;
import com.vinculohub.backend.dto.ProjectCreateResponse;
import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.dto.ProjectListItemDTO;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.exception.UserNotFoundException;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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

    @Mock private NpoRepository npoRepository;

    @Mock private UserRepository userRepository;

    @InjectMocks private ProjectService projectService;

    @Test
    @DisplayName("Deve criar projeto usando ODS normalizado")
    void shouldCreateProjectSuccessfully() {
        String auth0Id = "auth0|npo";
        User user = User.builder().id(10).auth0Id(auth0Id).build();
        Npo npo = Npo.builder().id(20).name("ONG Exemplo").build();
        ProjectCreateRequest request = validCreateRequest();
        Set<Integer> odsCodes = new LinkedHashSet<>(List.of(1, 2));

        when(userRepository.findByAuth0Id(auth0Id)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(10)).thenReturn(Optional.of(npo));
        when(odsMapper.normalizeCodes(List.of("1", "2"))).thenReturn(odsCodes);
        when(projectRepository.save(any(Project.class)))
                .thenAnswer(
                        invocation -> {
                            Project project = invocation.getArgument(0);
                            project.setId(30L);
                            return project;
                        });

        ProjectCreateResponse response = projectService.createProject(auth0Id, request);

        assertEquals(30L, response.id());
        assertEquals(20, response.npoId());
        assertEquals("Projeto de impacto", response.title());
        assertEquals(
                "Resumo do projeto com impacto social mensurável e escopo bem definido.",
                response.description());
        assertEquals(ProjectStatus.ACTIVE, response.status());
        assertEquals(new BigDecimal("1000.00"), response.budgetNeeded());
        assertEquals(BigDecimal.ZERO, response.investedAmount());
        assertEquals(
                List.of(new OdsResponse(1, "ODS 1"), new OdsResponse(2, "ODS 2")),
                response.ods());

        ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
        verify(projectRepository).save(projectCaptor.capture());

        Project savedProject = projectCaptor.getValue();
        assertEquals(npo, savedProject.getNpo());
        assertEquals("Projeto de impacto", savedProject.getTitle());
        assertEquals(
                "Resumo do projeto com impacto social mensurável e escopo bem definido.",
                savedProject.getDescription());
        assertEquals(new BigDecimal("1000.00"), savedProject.getBudgetNeeded());
        assertEquals(BigDecimal.ZERO, savedProject.getInvestedAmount());
        assertEquals(ProjectStatus.ACTIVE, savedProject.getStatus());
        assertEquals(LocalDate.of(2026, 5, 10), savedProject.getStartDate());
        assertEquals(LocalDate.of(2026, 12, 20), savedProject.getEndDate());
        assertEquals(odsCodes, savedProject.getOdsCodes());

        verify(userRepository).findByAuth0Id(auth0Id);
        verify(npoRepository).findByUserId(10);
        verify(odsMapper).normalizeCodes(List.of("1", "2"));
    }

    @Test
    @DisplayName("Deve rejeitar criação de projeto sem usuário autenticado")
    void shouldThrowBadRequestExceptionWhenAuth0IdIsBlank() {
        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () -> projectService.createProject(" ", validCreateRequest()));

        assertEquals("Não foi possível identificar o usuário autenticado.", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar UserNotFoundException quando usuário não existe")
    void shouldThrowUserNotFoundExceptionWhenUserIsNotFound() {
        when(userRepository.findByAuth0Id("auth0|missing")).thenReturn(Optional.empty());

        assertThrows(
                UserNotFoundException.class,
                () -> projectService.createProject("auth0|missing", validCreateRequest()));
    }

    @Test
    @DisplayName("Deve lançar NotFoundException quando ONG não existe")
    void shouldThrowNotFoundExceptionWhenNpoIsNotFound() {
        User user = User.builder().id(10).auth0Id("auth0|npo").build();

        when(userRepository.findByAuth0Id("auth0|npo")).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(10)).thenReturn(Optional.empty());

        NotFoundException exception =
                assertThrows(
                        NotFoundException.class,
                        () -> projectService.createProject("auth0|npo", validCreateRequest()));

        assertEquals("ONG não encontrada", exception.getMessage());
    }

    @Test
    @DisplayName("Deve rejeitar ODS inválido")
    void shouldThrowBadRequestExceptionWhenOdsMapperRejectsInvalidOds() {
        User user = User.builder().id(10).auth0Id("auth0|npo").build();
        Npo npo = Npo.builder().id(20).name("ONG Exemplo").build();

        when(userRepository.findByAuth0Id("auth0|npo")).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(10)).thenReturn(Optional.of(npo));
        when(odsMapper.normalizeCodes(List.of("1", "99")))
                .thenThrow(new IllegalArgumentException("ODS inválido."));

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () -> projectService.createProject("auth0|npo", invalidOdsRequest()));

        assertEquals("ODS inválido", exception.getMessage());
    }

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

    private static ProjectCreateRequest validCreateRequest() {
        return ProjectCreateRequest.builder()
                .title("Projeto de impacto")
                .description(
                        "Resumo do projeto com impacto social mensurável e escopo bem definido.")
                .budgetNeeded(new BigDecimal("1000.00"))
                .startDate(LocalDate.of(2026, 5, 10))
                .endDate(LocalDate.of(2026, 12, 20))
                .odsIds(List.of(1, 2))
                .build();
    }

    private static ProjectCreateRequest invalidOdsRequest() {
        return ProjectCreateRequest.builder()
                .title("Projeto de impacto")
                .description(
                        "Resumo do projeto com impacto social mensurável e escopo bem definido.")
                .budgetNeeded(new BigDecimal("1000.00"))
                .startDate(LocalDate.of(2026, 5, 10))
                .endDate(LocalDate.of(2026, 12, 20))
                .odsIds(List.of(1, 99))
                .build();
    }
}
