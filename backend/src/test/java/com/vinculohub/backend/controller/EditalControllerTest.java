/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.dto.EditalResponseDTO;
import com.vinculohub.backend.service.EditalService;
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
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = EditalController.class,
        excludeAutoConfiguration = {
            SecurityAutoConfiguration.class,
            SecurityFilterAutoConfiguration.class,
            OAuth2ResourceServerAutoConfiguration.class
        })
@AutoConfigureMockMvc(addFilters = false)
class EditalControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private EditalService editalService;

    @Test
    @DisplayName("GET /api/editais retorna lista paginada quando active=false (default)")
    void shouldListAllEditais() throws Exception {
        EditalResponseDTO edital = buildEdital(1L, "Edital 2026");
        when(editalService.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(edital)));

        mockMvc.perform(get("/api/editais").param("active", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Edital 2026"));

        verify(editalService).findAll(any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/editais retorna somente ativos quando active=true")
    void shouldListActiveEditais() throws Exception {
        EditalResponseDTO edital = buildEdital(2L, "Edital Ativo");
        when(editalService.findAllActive(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(edital)));

        mockMvc.perform(get("/api/editais").param("active", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(2))
                .andExpect(jsonPath("$.content[0].title").value("Edital Ativo"));

        verify(editalService).findAllActive(any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/editais sem parâmetro active usa default=false e chama findAll")
    void shouldDefaultToFindAll() throws Exception {
        when(editalService.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/editais")).andExpect(status().isOk());

        verify(editalService).findAll(any(Pageable.class));
    }

    private EditalResponseDTO buildEdital(Long id, String title) {
        return new EditalResponseDTO(
                id, title, "Desc", "https://url.com/edital.pdf",
                "edital.pdf", 1024L, "application/pdf",
                List.of(),
                LocalDateTime.now().plusDays(30),
                LocalDateTime.now(),
                LocalDateTime.now());
    }
}
