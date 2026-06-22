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
import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.dto.CompanyExportDTO;
import com.vinculohub.backend.dto.CompanyListItemResponse;
import com.vinculohub.backend.dto.NpoListItemResponse;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.service.CompanyService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
class CompanyControllerTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private CompanyRepository companyRepository;

    @Autowired private UserRepository userRepository;

    @Autowired private AddressRepository addressRepository;

    @Autowired private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setup() {
        jdbcTemplate.update("DELETE FROM company_project");
        jdbcTemplate.update("DELETE FROM project_ods");
        jdbcTemplate.update("DELETE FROM document");
        jdbcTemplate.update("DELETE FROM project");
        jdbcTemplate.update("DELETE FROM npo");
        jdbcTemplate.update("DELETE FROM company");
        jdbcTemplate.update("DELETE FROM address");
        jdbcTemplate.update("DELETE FROM users");
    }

    @Test
    @DisplayName("GET /api/me/company/profile retorna 200 para empresa autenticada")
    void shouldReturn200ForAuthenticatedCompanyProfile() throws Exception {
        User companyUser =
                userRepository.save(
                        User.builder()
                                .name("Empresa Responsavel")
                                .email("empresa@teste.com")
                                .auth0Id("auth0|company-profile")
                                .userType(UserType.company)
                                .build());

        Address address =
                addressRepository.save(
                        Address.builder()
                                .state("São Paulo")
                                .stateCode("SP")
                                .city("São Paulo")
                                .street("Avenida Paulista")
                                .number("1000")
                                .complement("Sala 100")
                                .zipCode("01310-100")
                                .build());

        Company company = new Company();
        company.setLegalName("Empresa Teste Ltda");
        company.setSocialName("Empresa Teste");
        company.setDescription("Descrição da empresa");
        company.setLogoUrl("http://logo.com/logo.png");
        company.setCnpj("11222333000181");
        company.setPhone("(11) 4002-8922");
        company.setAddress(address);
        company.setUser(companyUser);
        companyRepository.save(company);

        mockMvc.perform(
                        get("/api/me/company/profile")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|company-profile"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.institutionalData.legalName").value("Empresa Teste Ltda"))
                .andExpect(jsonPath("$.institutionalData.socialName").value("Empresa Teste"))
                .andExpect(jsonPath("$.contact.email").value("empresa@teste.com"))
                .andExpect(jsonPath("$.address.city").value("São Paulo"))
                .andExpect(jsonPath("$.responsible.name").value("Empresa Responsavel"))
                .andExpect(jsonPath("$.responsible.email").value("empresa@teste.com"));
    }

    @Test
    @DisplayName("GET /api/me/company/profile retorna 401 sem autenticação")
    void shouldReturn401WithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/me/company/profile")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/me/company/profile retorna 404 para usuário autenticado sem empresa")
    void shouldReturn404ForAuthenticatedUserWithoutCompany() throws Exception {
        userRepository.save(
                User.builder()
                        .name("Outro Usuário")
                        .email("outro@teste.com")
                        .auth0Id("auth0|no-company")
                        .userType(UserType.company)
                        .build());

        mockMvc.perform(
                        get("/api/me/company/profile")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|no-company"))))
                .andExpect(status().isNotFound());
    }
}

@WebMvcTest(controllers = CompanyController.class)
@Import({SecurityConfig.class, CompanyControllerWebMvcTest.JwtDecoderTestConfig.class})
@TestPropertySource(
        properties = {
            "app.frontend.url=http://localhost:5173",
            "app.auth0.roles-claim=https://vinculohub/roles"
        })
class CompanyControllerWebMvcTest {

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
    @DisplayName("GET /api/company/npos lista ONGs paginadas para empresa")
    void shouldListNposForAuthenticatedCompanyWithPagination() throws Exception {
        var response =
                NpoListItemResponse.builder()
                        .id(9)
                        .name("ONG Horizonte")
                        .description("Projetos de inclusão produtiva.")
                        .logoUrl("https://example.com/horizonte.png")
                        .city("Curitiba")
                        .stateCode("PR")
                        .build();

        when(companyService.findAllForCompanyListing(any(), any(Pageable.class)))
                .thenAnswer(
                        invocation ->
                                new PageImpl<>(List.of(response), invocation.getArgument(1), 4));

        mockMvc.perform(
                        get("/api/company/npos")
                                .param("name", "Hori")
                                .param("page", "1")
                                .param("size", "3")
                                .param("sort", "name,desc")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|company"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(9))
                .andExpect(jsonPath("$.content[0].name").value("ONG Horizonte"))
                .andExpect(
                        jsonPath("$.content[0].description")
                                .value("Projetos de inclusão produtiva."))
                .andExpect(jsonPath("$.content[0].city").value("Curitiba"))
                .andExpect(jsonPath("$.content[0].stateCode").value("PR"))
                .andExpect(jsonPath("$.content[0].active").doesNotExist())
                .andExpect(jsonPath("$.totalElements").value(4))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.number").value(1))
                .andExpect(jsonPath("$.size").value(3));

        ArgumentCaptor<String> nameCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(companyService)
                .findAllForCompanyListing(nameCaptor.capture(), pageableCaptor.capture());
        org.assertj.core.api.Assertions.assertThat(nameCaptor.getValue()).isEqualTo("Hori");
        Pageable pageable = pageableCaptor.getValue();
        org.assertj.core.api.Assertions.assertThat(pageable.getPageNumber()).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(pageable.getPageSize()).isEqualTo(3);
        org.assertj.core.api.Assertions.assertThat(
                        pageable.getSort().getOrderFor("name").getDirection().name())
                .isEqualTo("DESC");
    }

    @Test
    @DisplayName("GET /api/company/npos sem autenticação retorna 401")
    void shouldRejectCompanyNpoListingWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/company/npos")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/company/npos bloqueia ONG")
    void shouldRejectCompanyNpoListingForNpoRole() throws Exception {
        mockMvc.perform(
                        get("/api/company/npos")
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_NPO"))
                                                .jwt(jwt -> jwt.subject("auth0|npo"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/company/npos bloqueia admin")
    void shouldRejectCompanyNpoListingForAdminRole() throws Exception {
        mockMvc.perform(
                        get("/api/company/npos")
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
