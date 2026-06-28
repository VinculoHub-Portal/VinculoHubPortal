/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.dto.AdminMetricsResponse;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.service.AdminMetricsService;
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
import org.springframework.data.domain.Pageable;
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
    @DisplayName("GET /api/admin/metrics retorna métricas")
    void shouldReturnAdminMetrics() throws Exception {
        when(adminMetricsService.getMetrics())
                .thenReturn(new AdminMetricsResponse(10L, 3L, 5L, 2L));

        mockMvc.perform(get("/api/admin/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalNpos").value(10))
                .andExpect(jsonPath("$.publishedEditais").value(3))
                .andExpect(jsonPath("$.activeVinculos").value(5))
                .andExpect(jsonPath("$.pendingNotifications").value(2));
    }

    @Test
    @DisplayName("GET /api/admin/vinculos retorna página vazia de vínculos")
    void shouldReturnAdminVinculosEmptyPage() throws Exception {
        when(companyProjectRepository.findAllForAdmin(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/admin/vinculos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
    }
}
