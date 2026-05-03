/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.dto.NewProjectRequest;
import com.vinculohub.backend.dto.NewProjectResponse;
import com.vinculohub.backend.dto.NpoFirstProjectSignupRequest;
import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.dto.ProjectListItemDTO;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
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

    @Mock private OdsService odsService;

    @Mock private UserRepository userRepository;

    @Mock private NpoRepository npoRepository;

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

        when(odsService.resolveSelection(List.of("1", "2")))
                .thenReturn(
                        Set.of(
                                Ods.builder().id(1).name("Erradicação da Pobreza").build(),
                                Ods.builder()
                                        .id(2)
                                        .name("Fome Zero e Agricultura Sustentável")
                                        .build()));

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
        assertEquals(2, savedProject.getOds().size());
        verify(odsService).resolveSelection(List.of("1", "2"));
    }

    @Test
    void shouldCreateProjectForAuthenticatedNpo() {
        User user =
                User.builder()
                        .id(10)
                        .auth0Id("auth0|npo")
                        .email("npo@teste.com")
                        .userType(UserType.npo)
                        .build();
        Npo npo = Npo.builder().id(20).name("ONG Exemplo").build();
        NewProjectRequest request =
                new NewProjectRequest(
                        "Projeto Novo",
                        "Descrição do projeto novo",
                        ProjectType.TAX_INCENTIVE_LAW,
                        new BigDecimal("25000"),
                        List.of("4", "10"));
        Set<Ods> selectedOds =
                Set.of(
                        Ods.builder().id(4).name("Educação de Qualidade").build(),
                        Ods.builder().id(10).name("Redução das Desigualdades").build());

        when(userRepository.findByAuth0Id("auth0|npo")).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(10)).thenReturn(Optional.of(npo));
        when(odsService.resolveSelection(List.of("4", "10"))).thenReturn(selectedOds);
        when(projectRepository.save(any(Project.class)))
                .thenAnswer(
                        invocation -> {
                            Project project = invocation.getArgument(0);
                            project.setId(40L);
                            return project;
                        });

        NewProjectResponse response =
                projectService.createNewProjectForAuthenticatedNpo("auth0|npo", request);

        assertEquals(40L, response.id());
        assertEquals("Projeto Novo", response.name());
        assertEquals("Descrição do projeto novo", response.description());
        assertEquals(ProjectType.TAX_INCENTIVE_LAW, response.type());
        assertEquals(new BigDecimal("25000"), response.capital());
        assertEquals(20, response.npoId());
        verify(odsService).resolveSelection(List.of("4", "10"));
    }

    @Test
    void shouldIgnoreCapitalWhenCreatingSocialInvestmentProject() {
        User user =
                User.builder()
                        .id(10)
                        .auth0Id("auth0|npo")
                        .email("npo@teste.com")
                        .userType(UserType.npo)
                        .build();
        Npo npo = Npo.builder().id(20).name("ONG Exemplo").build();
        NewProjectRequest request =
                new NewProjectRequest(
                        "Projeto Social",
                        "Descrição do projeto social",
                        ProjectType.SOCIAL_INVESTMENT_LAW,
                        new BigDecimal("1000"),
                        List.of("1"));

        when(userRepository.findByAuth0Id("auth0|npo")).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(10)).thenReturn(Optional.of(npo));
        when(odsService.resolveSelection(List.of("1")))
                .thenReturn(Set.of(Ods.builder().id(1).name("Erradicação da Pobreza").build()));
        when(projectRepository.save(any(Project.class)))
                .thenAnswer(
                        invocation -> {
                            Project project = invocation.getArgument(0);
                            project.setId(41L);
                            return project;
                        });

        NewProjectResponse response =
                projectService.createNewProjectForAuthenticatedNpo("auth0|npo", request);

        assertEquals(ProjectType.SOCIAL_INVESTMENT_LAW, response.type());
        assertNull(response.capital());
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
}
