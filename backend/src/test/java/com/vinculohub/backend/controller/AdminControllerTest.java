/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.dto.AdminNpoCardResponse;
import com.vinculohub.backend.dto.AdminRelationshipResponse;
import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.service.AdminNpoService;
import com.vinculohub.backend.service.AdminRelationshipService;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = AdminController.class,
        excludeAutoConfiguration = {
            SecurityAutoConfiguration.class,
            SecurityFilterAutoConfiguration.class,
            OAuth2ResourceServerAutoConfiguration.class
        })
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private AdminNpoService adminNpoService;
    @MockBean private AdminRelationshipService adminRelationshipService;

    @Test
    @DisplayName("GET /api/admin/ongs lista ONGs para admin")
    void shouldListAdminNpos() throws Exception {
        Page<AdminNpoCardResponse> page =
                new PageImpl<>(
                        List.of(
                                new AdminNpoCardResponse(
                                        1,
                                        "ONG Verde",
                                        "https://cdn.example.com/logo.png",
                                        true,
                                        true,
                                        false,
                                        false,
                                        "Porto Alegre",
                                        "RS",
                                        LocalDateTime.of(2026, 5, 29, 12, 0))),
                        PageRequest.of(2, 5, Sort.by(Sort.Direction.DESC, "createdAt")),
                        11);

        when(adminNpoService.listNpos(
                        eq("Verde"), eq("environmental"), eq(true), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(
                        get("/api/admin/ongs")
                                .param("search", "Verde")
                                .param("area", "environmental")
                                .param("active", "true")
                                .param("page", "2")
                                .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("ONG Verde"))
                .andExpect(
                        jsonPath("$.content[0].logoUrl").value("https://cdn.example.com/logo.png"))
                .andExpect(jsonPath("$.content[0].active").value(true))
                .andExpect(jsonPath("$.content[0].environmental").value(true))
                .andExpect(jsonPath("$.content[0].city").value("Porto Alegre"))
                .andExpect(jsonPath("$.content[0].stateCode").value("RS"))
                .andExpect(jsonPath("$.totalElements").value(11))
                .andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.number").value(2))
                .andExpect(jsonPath("$.size").value(5));

        verify(adminNpoService)
                .listNpos(eq("Verde"), eq("environmental"), eq(true), any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/admin/vinculos lista vínculos para admin")
    void shouldListAdminRelationships() throws Exception {
        Page<AdminRelationshipResponse> page =
                new PageImpl<>(
                        List.of(
                                new AdminRelationshipResponse(
                                        7,
                                        "Empresa Verde",
                                        "company@verde.com",
                                        9,
                                        "ONG Verde",
                                        "ong@verde.com",
                                        99L,
                                        "Projeto Impacto",
                                        RelationshipStatus.active,
                                        InitiatorType.company,
                                        LocalDateTime.of(2026, 5, 20, 10, 0),
                                        LocalDateTime.of(2026, 5, 29, 12, 0),
                                        LocalDateTime.of(2026, 5, 21, 10, 0),
                                        null,
                                        null)),
                        PageRequest.of(1, 7, Sort.by(Sort.Direction.DESC, "updatedAt")),
                        8);

        when(adminRelationshipService.listRelationships(
                        eq("Empresa Verde"),
                        eq("ONG Verde"),
                        eq("Projeto Impacto"),
                        eq(RelationshipStatus.active),
                        any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(
                        get("/api/admin/vinculos")
                                .param("companyName", "Empresa Verde")
                                .param("npoName", "ONG Verde")
                                .param("projectTitle", "Projeto Impacto")
                                .param("status", "active")
                                .param("page", "1")
                                .param("size", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].companyName").value("Empresa Verde"))
                .andExpect(jsonPath("$.content[0].companyEmail").value("company@verde.com"))
                .andExpect(jsonPath("$.content[0].npoName").value("ONG Verde"))
                .andExpect(jsonPath("$.content[0].npoEmail").value("ong@verde.com"))
                .andExpect(jsonPath("$.content[0].projectTitle").value("Projeto Impacto"))
                .andExpect(jsonPath("$.content[0].status").value("active"))
                .andExpect(jsonPath("$.content[0].initiatorType").value("company"))
                .andExpect(jsonPath("$.totalElements").value(8))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.number").value(1))
                .andExpect(jsonPath("$.size").value(7));

        verify(adminRelationshipService)
                .listRelationships(
                        eq("Empresa Verde"),
                        eq("ONG Verde"),
                        eq("Projeto Impacto"),
                        eq(RelationshipStatus.active),
                        any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/admin/ongs sem filtros usa paginação padrão")
    void shouldUseDefaultPaginationForNpoList() throws Exception {
        when(adminNpoService.listNpos(
                        nullable(String.class),
                        nullable(String.class),
                        nullable(Boolean.class),
                        any(Pageable.class)))
                .thenReturn(
                        new PageImpl<>(
                                List.of(),
                                PageRequest.of(0, 12, Sort.by(Sort.Direction.DESC, "createdAt")),
                                0));

        mockMvc.perform(get("/api/admin/ongs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));

        verify(adminNpoService)
                .listNpos(
                        nullable(String.class),
                        nullable(String.class),
                        nullable(Boolean.class),
                        any(Pageable.class));
    }
}
