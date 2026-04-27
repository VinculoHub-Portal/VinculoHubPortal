/* (C)2026 */
package com.vinculohub.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.ProjectSummaryDTO;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectStatusFilter;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProjectListingServiceTest {

    private static final String AUTH0_ID = "auth0|user-123";
    private static final Long NPO_ID = 10L;

    @Mock private UserRepository userRepository;
    @Mock private NpoRepository npoRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private ProjectRepository projectRepository;

    @InjectMocks private ProjectListingService service;

    private User npoUser(Integer userId) {
        return User.builder().id(userId).auth0Id(AUTH0_ID).userType(UserType.npo).build();
    }

    private User companyUser(Integer userId) {
        return User.builder().id(userId).auth0Id(AUTH0_ID).userType(UserType.company).build();
    }

    private Npo sampleNpo() {
        return Npo.builder().id(NPO_ID.intValue()).userId(1).build();
    }

    private Company company(Integer id) {
        Company c = new Company();
        c.setId(id);
        return c;
    }

    private Project sampleProject(Long id, ProjectStatus status) {
        return Project.builder()
                .id(id)
                .npo(sampleNpo())
                .title("p" + id)
                .description("d")
                .status(status)
                .budgetNeeded(new BigDecimal("100.00"))
                .investedAmount(new BigDecimal("0.00"))
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(30))
                .build();
    }

    @Test
    @DisplayName("NPO autenticado com filtro TODOS retorna todos os projetos da ONG")
    void npoListsAllProjectsWhenFilterTodos() {
        User user = npoUser(1);
        Project p1 = sampleProject(1L, ProjectStatus.ACTIVE);
        Project p2 = sampleProject(2L, ProjectStatus.COMPLETED);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(sampleNpo()));
        when(projectRepository.findAllByNpoId(NPO_ID)).thenReturn(List.of(p1, p2));

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).extracting(ProjectSummaryDTO::id).containsExactly(1L, 2L);
        verify(projectRepository).findAllByNpoId(NPO_ID);
        verify(projectRepository, never()).findAllByNpoIdAndStatus(anyLong(), any());
    }

    @Test
    @DisplayName("NPO autenticado com filtro ATIVOS chama repository com ProjectStatus.ACTIVE")
    void npoListsActiveOnly() {
        User user = npoUser(1);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(sampleNpo()));
        when(projectRepository.findAllByNpoIdAndStatus(NPO_ID, ProjectStatus.ACTIVE))
                .thenReturn(List.of(sampleProject(1L, ProjectStatus.ACTIVE)));

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.ATIVOS);

        assertThat(result).hasSize(1);
        verify(projectRepository).findAllByNpoIdAndStatus(NPO_ID, ProjectStatus.ACTIVE);
    }

    @Test
    @DisplayName(
            "NPO autenticado com filtro COMPLETADOS chama repository com ProjectStatus.COMPLETED")
    void npoListsCompletedOnly() {
        User user = npoUser(1);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(sampleNpo()));
        when(projectRepository.findAllByNpoIdAndStatus(NPO_ID, ProjectStatus.COMPLETED))
                .thenReturn(List.of());

        service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.COMPLETADOS);

        verify(projectRepository).findAllByNpoIdAndStatus(NPO_ID, ProjectStatus.COMPLETED);
    }

    @Test
    @DisplayName(
            "NPO autenticado com filtro CANCELADOS chama repository com ProjectStatus.CANCELLED")
    void npoListsCancelledOnly() {
        User user = npoUser(1);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(sampleNpo()));
        when(projectRepository.findAllByNpoIdAndStatus(NPO_ID, ProjectStatus.CANCELLED))
                .thenReturn(List.of());

        service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.CANCELADOS);

        verify(projectRepository).findAllByNpoIdAndStatus(NPO_ID, ProjectStatus.CANCELLED);
    }

    @Test
    @DisplayName(
            "NPO autenticado sem ONG associada retorna lista vazia sem chamar ProjectRepository")
    void npoUserWithoutNpoReturnsEmpty() {
        User user = npoUser(1);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.empty());

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).isEmpty();
        verifyNoInteractions(projectRepository);
    }

    @Test
    @DisplayName("NPO autenticado com ONG mas sem projetos retorna lista vazia")
    void npoWithNoProjectsReturnsEmpty() {
        User user = npoUser(1);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(sampleNpo()));
        when(projectRepository.findAllByNpoId(NPO_ID)).thenReturn(List.of());

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Filtro sem match retorna lista vazia")
    void filterWithNoMatchReturnsEmpty() {
        User user = npoUser(1);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(sampleNpo()));
        when(projectRepository.findAllByNpoIdAndStatus(NPO_ID, ProjectStatus.CANCELLED))
                .thenReturn(List.of());

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.CANCELADOS);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Company autenticada com filtro TODOS retorna projetos vinculados")
    void companyListsAllLinkedProjects() {
        User user = companyUser(2);
        Company company = company(20);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(2)).thenReturn(Optional.of(company));
        when(projectRepository.findAllByCompanyId(20))
                .thenReturn(List.of(sampleProject(5L, ProjectStatus.ACTIVE)));

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).extracting(ProjectSummaryDTO::id).containsExactly(5L);
        verify(projectRepository).findAllByCompanyId(20);
        verify(projectRepository, never()).findAllByCompanyIdAndStatus(anyInt(), anyString());
    }

    @Test
    @DisplayName("Company autenticada com filtro ATIVOS chama findAllByCompanyIdAndStatus com 'ACTIVE'")
    void companyListsActiveOnly() {
        User user = companyUser(2);
        Company company = company(20);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(2)).thenReturn(Optional.of(company));
        when(projectRepository.findAllByCompanyIdAndStatus(20, "ACTIVE"))
                .thenReturn(List.of(sampleProject(5L, ProjectStatus.ACTIVE)));

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.ATIVOS);

        assertThat(result).hasSize(1);
        verify(projectRepository).findAllByCompanyIdAndStatus(20, "ACTIVE");
    }

    @Test
    @DisplayName("Company sem registro Company associado retorna lista vazia")
    void companyUserWithoutCompanyReturnsEmpty() {
        User user = companyUser(2);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(2)).thenReturn(Optional.empty());

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).isEmpty();
        verifyNoInteractions(projectRepository);
    }

    @Test
    @DisplayName("User não encontrado por auth0Id retorna lista vazia")
    void unknownUserReturnsEmpty() {
        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.empty());

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).isEmpty();
        verifyNoInteractions(npoRepository, companyRepository, projectRepository);
    }
}
