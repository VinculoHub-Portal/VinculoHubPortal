/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.config.SecurityConfig;
import com.vinculohub.backend.dto.CompanyExportDTO;
import com.vinculohub.backend.dto.CompanyListItemResponse;
import com.vinculohub.backend.service.CompanyService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = CompanyController.class)
@Import({SecurityConfig.class, CompanyControllerTest.JwtDecoderTestConfig.class})
@TestPropertySource(
        properties = {
            "app.frontend.url=http://localhost:5173",
            "app.auth0.roles-claim=https://vinculohub/roles"
        })
class CompanyControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private CompanyService companyService;

    @Test
    @DisplayName("GET /api/npo/companies lista empresas paginadas para ONG")
    void shouldListCompaniesForAuthenticatedNpoWithPagination() throws Exception {
        var response =
                CompanyListItemResponse.builder()
                        .id(3)
                        .legalName("Empresa Gama LTDA")
                        .socialName("Gama Social")
                        .description("Descrição institucional")
                        .logoUrl("https://example.com/gama.png")
                        .city("Recife")
                        .state("PE")
                        .build();

        when(companyService.findAllForNpoListing(any(Pageable.class)))
                .thenAnswer(
                        invocation ->
                                new PageImpl<>(List.of(response), invocation.getArgument(0), 3));

        mockMvc.perform(
                        get("/api/npo/companies")
                                .param("page", "0")
                                .param("size", "2")
                                .param("sort", "legalName,desc")
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_NPO"))
                                                .jwt(jwt -> jwt.subject("auth0|npo"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(3))
                .andExpect(jsonPath("$.content[0].legalName").value("Empresa Gama LTDA"))
                .andExpect(jsonPath("$.content[0].socialName").value("Gama Social"))
                .andExpect(jsonPath("$.content[0].city").value("Recife"))
                .andExpect(jsonPath("$.content[0].state").value("PE"))
                .andExpect(jsonPath("$.content[0].cnpj").doesNotExist())
                .andExpect(jsonPath("$.content[0].email").doesNotExist())
                .andExpect(jsonPath("$.content[0].phone").doesNotExist())
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.number").value(0))
                .andExpect(jsonPath("$.size").value(2));

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(companyService).findAllForNpoListing(pageableCaptor.capture());
        Pageable pageable = pageableCaptor.getValue();
        org.assertj.core.api.Assertions.assertThat(pageable.getPageNumber()).isZero();
        org.assertj.core.api.Assertions.assertThat(pageable.getPageSize()).isEqualTo(2);
        org.assertj.core.api.Assertions.assertThat(
                        pageable.getSort().getOrderFor("legalName").getDirection().name())
                .isEqualTo("DESC");
    }

    @Test
    @DisplayName("GET /api/npo/companies sem autenticação retorna 401")
    void shouldRejectNpoCompanyListingWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/npo/companies")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/npo/companies bloqueia empresa")
    void shouldRejectNpoCompanyListingForCompanyRole() throws Exception {
        mockMvc.perform(
                        get("/api/npo/companies")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|company"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/npo/companies bloqueia admin")
    void shouldRejectNpoCompanyListingForAdminRole() throws Exception {
        mockMvc.perform(
                        get("/api/npo/companies")
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))
                                                .jwt(jwt -> jwt.subject("auth0|admin"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/companies continua retornando exportação administrativa")
    void shouldKeepAdminCompanyExportEndpointUnchanged() throws Exception {
        when(companyService.findAllForExport())
                .thenReturn(
                        List.of(
                                CompanyExportDTO.builder()
                                        .id(4)
                                        .legalName("Empresa Export LTDA")
                                        .socialName("Export Social")
                                        .cnpj("44444444000191")
                                        .phone("(11) 99999-9999")
                                        .email("empresa-export@example.com")
                                        .city("Natal")
                                        .state("RN")
                                        .zipCode("59000-000")
                                        .createdAt(LocalDateTime.of(2026, 6, 8, 12, 0))
                                        .build()));

        mockMvc.perform(
                        get("/api/companies")
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))
                                                .jwt(jwt -> jwt.subject("auth0|admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].legalName").value("Empresa Export LTDA"))
                .andExpect(jsonPath("$[0].cnpj").value("44444444000191"))
                .andExpect(jsonPath("$[0].email").value("empresa-export@example.com"))
                .andExpect(jsonPath("$[0].city").value("Natal"))
                .andExpect(jsonPath("$[0].state").value("RN"));
    }

    @TestConfiguration
    static class JwtDecoderTestConfig {
        @Bean
        JwtDecoder jwtDecoder() {
            return mock(JwtDecoder.class);
        }
    }
}
