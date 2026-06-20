/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.dto.AdminMetricsResponse;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.CompanyProjectId;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.service.AdminMetricsService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = AdminMetricsController.class,
        excludeAutoConfiguration = {
            SecurityAutoConfiguration.class,
            SecurityFilterAutoConfiguration.class,
            OAuth2ResourceServerAutoConfiguration.class
        })
@AutoConfigureMockMvc(addFilters = false)
class AdminMetricsControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private AdminMetricsService adminMetricsService;
    @MockBean private CompanyProjectRepository companyProjectRepository;

    @Test
    @DisplayName("GET /api/admin/metrics retorna métricas agregadas")
    void shouldReturnMetrics() throws Exception {
        when(adminMetricsService.getMetrics())
                .thenReturn(new AdminMetricsResponse(10L, 4L, 7L, 2L));

        mockMvc.perform(get("/api/admin/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalNpos").value(10))
                .andExpect(jsonPath("$.publishedEditais").value(4))
                .andExpect(jsonPath("$.activeVinculos").value(7))
                .andExpect(jsonPath("$.pendingNotifications").value(2));

        verify(adminMetricsService).getMetrics();
    }

    @Test
    @DisplayName(
            "GET /api/admin/vinculos/list retorna a listagem simples sem conflitar com a rota"
                    + " filtrada")
    void shouldListVinculosFromDedicatedRoute() throws Exception {
        Company company = new Company();
        company.setId(7);
        company.setLegalName("Empresa Verde");

        Npo npo = Npo.builder().id(9).name("ONG Azul").build();
        Project project = Project.builder().id(99L).title("Projeto Impacto").npo(npo).build();

        CompanyProject relationship =
                CompanyProject.builder()
                        .id(new CompanyProjectId(7, 99L))
                        .company(company)
                        .project(project)
                        .status(RelationshipStatus.active)
                        .createdAt(LocalDateTime.of(2026, 5, 29, 12, 0))
                        .build();

        when(companyProjectRepository.findAllForAdmin(
                        PageRequest.of(1, 5, Sort.by(Sort.Direction.DESC, "createdAt"))))
                .thenReturn(
                        new PageImpl<>(
                                List.of(relationship),
                                PageRequest.of(1, 5, Sort.by(Sort.Direction.DESC, "createdAt")),
                                6));

        mockMvc.perform(get("/api/admin/vinculos/list").param("page", "1").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].companyName").value("Empresa Verde"))
                .andExpect(jsonPath("$.content[0].projectTitle").value("Projeto Impacto"))
                .andExpect(jsonPath("$.content[0].npoName").value("ONG Azul"))
                .andExpect(jsonPath("$.content[0].status").value("active"))
                .andExpect(jsonPath("$.totalElements").value(6))
                .andExpect(jsonPath("$.totalPages").value(2));
    }
}
