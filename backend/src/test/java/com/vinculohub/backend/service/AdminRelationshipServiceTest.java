/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.AdminRelationshipResponse;
import com.vinculohub.backend.model.*;
import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

@ExtendWith(MockitoExtension.class)
class AdminRelationshipServiceTest {

    @Mock private CompanyProjectRepository companyProjectRepository;

    @InjectMocks private AdminRelationshipService adminRelationshipService;

    @Test
    @DisplayName("Deve listar relacionamentos com todos os filtros nulos")
    void shouldListRelationshipsWithNullFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        CompanyProject cp =
                buildRelationship("Empresa Alpha", "Alpha Social", "ONG Verde", "Projeto A");

        when(companyProjectRepository.findAdminRelationships(null, null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(cp), pageable, 1));

        Page<AdminRelationshipResponse> result =
                adminRelationshipService.listRelationships(null, null, null, null, pageable);

        assertEquals(1, result.getTotalElements());
        AdminRelationshipResponse resp = result.getContent().get(0);
        assertEquals(1, resp.companyId());
        assertEquals("Alpha Social", resp.companyName());
        assertEquals("empresa@test.com", resp.companyEmail());
        assertEquals(2, resp.npoId());
        assertEquals("ONG Verde", resp.npoName());
        assertEquals("ong@test.com", resp.npoEmail());
        assertEquals(RelationshipStatus.pending, resp.status());
    }

    @Test
    @DisplayName("Deve normalizar filtros: trim e lowercase")
    void shouldNormalizeFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        when(companyProjectRepository.findAdminRelationships(
                        eq("empresa"), eq("ong"), eq("projeto"), any(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        adminRelationshipService.listRelationships(
                "  Empresa  ", "  ONG  ", "  Projeto  ", null, pageable);

        verify(companyProjectRepository)
                .findAdminRelationships("empresa", "ong", "projeto", null, pageable);
    }

    @Test
    @DisplayName("Deve converter string vazia de filtro para null")
    void shouldConvertBlankFilterToNull() {
        Pageable pageable = PageRequest.of(0, 10);
        when(companyProjectRepository.findAdminRelationships(null, null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        adminRelationshipService.listRelationships("   ", "   ", "   ", null, pageable);

        verify(companyProjectRepository).findAdminRelationships(null, null, null, null, pageable);
    }

    @Test
    @DisplayName("Deve usar socialName da empresa quando disponível")
    void shouldUseCompanySocialNameWhenAvailable() {
        Pageable pageable = PageRequest.of(0, 10);
        CompanyProject cp =
                buildRelationship("Empresa Legal LTDA", "Nome Social", "ONG X", "Projeto B");

        when(companyProjectRepository.findAdminRelationships(any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(cp), pageable, 1));

        Page<AdminRelationshipResponse> result =
                adminRelationshipService.listRelationships(null, null, null, null, pageable);

        assertEquals("Nome Social", result.getContent().get(0).companyName());
    }

    @Test
    @DisplayName("Deve usar legalName quando socialName é null")
    void shouldUseLegalNameWhenSocialNameIsNull() {
        Pageable pageable = PageRequest.of(0, 10);
        CompanyProject cp = buildRelationship("Empresa Legal LTDA", null, "ONG X", "Projeto B");

        when(companyProjectRepository.findAdminRelationships(any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(cp), pageable, 1));

        Page<AdminRelationshipResponse> result =
                adminRelationshipService.listRelationships(null, null, null, null, pageable);

        assertEquals("Empresa Legal LTDA", result.getContent().get(0).companyName());
    }

    @Test
    @DisplayName("Deve mapear null para emails quando usuário não existe")
    void shouldMapNullEmailsWhenUsersAreNull() {
        Pageable pageable = PageRequest.of(0, 10);
        CompanyProject cp = buildRelationshipNoUsers();

        when(companyProjectRepository.findAdminRelationships(any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(cp), pageable, 1));

        Page<AdminRelationshipResponse> result =
                adminRelationshipService.listRelationships(null, null, null, null, pageable);

        assertNull(result.getContent().get(0).companyEmail());
        assertNull(result.getContent().get(0).npoEmail());
    }

    @Test
    @DisplayName("Deve filtrar por status")
    void shouldFilterByStatus() {
        Pageable pageable = PageRequest.of(0, 10);
        when(companyProjectRepository.findAdminRelationships(
                        null, null, null, RelationshipStatus.active, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        adminRelationshipService.listRelationships(
                null, null, null, RelationshipStatus.active, pageable);

        verify(companyProjectRepository)
                .findAdminRelationships(null, null, null, RelationshipStatus.active, pageable);
    }

    private CompanyProject buildRelationship(
            String legalName, String socialName, String npoName, String projectTitle) {
        User companyUser = new User();
        companyUser.setId(10);
        companyUser.setEmail("empresa@test.com");

        Company company = new Company();
        company.setId(1);
        company.setLegalName(legalName);
        company.setSocialName(socialName);
        company.setUser(companyUser);

        User npoUser = new User();
        npoUser.setId(20);
        npoUser.setEmail("ong@test.com");

        Npo npo = new Npo();
        npo.setId(2);
        npo.setName(npoName);
        npo.setNpoUser(npoUser);

        Project project = new Project();
        project.setId(3L);
        project.setTitle(projectTitle);
        project.setNpo(npo);

        return CompanyProject.builder()
                .company(company)
                .project(project)
                .status(RelationshipStatus.pending)
                .initiatorType(InitiatorType.company)
                .build();
    }

    private CompanyProject buildRelationshipNoUsers() {
        Company company = new Company();
        company.setId(1);
        company.setLegalName("Empresa Sem User");
        company.setSocialName(null);
        company.setUser(null);

        Npo npo = new Npo();
        npo.setId(2);
        npo.setName("ONG Sem User");
        npo.setNpoUser(null);

        Project project = new Project();
        project.setId(3L);
        project.setTitle("Projeto");
        project.setNpo(npo);

        return CompanyProject.builder()
                .company(company)
                .project(project)
                .status(RelationshipStatus.pending)
                .initiatorType(InitiatorType.npo)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
