/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
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
                                        jwt()
                                                .authorities(
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
                                        jwt()
                                                .authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|no-company"))))
                .andExpect(status().isNotFound());
    }
}
