/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
class MeControllerTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private NpoRepository npoRepository;
    @Autowired private CompanyRepository companyRepository;

    @BeforeEach
    void setup() {
        companyRepository.deleteAll();
        npoRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("GET /api/me/profile retorna companyName quando usuário é company")
    void shouldReturnCompanyNameForCompanyUser() throws Exception {
        User user =
                userRepository.save(
                        User.builder()
                                .name("Empresa Usuário")
                                .email("company@exemplo.com")
                                .auth0Id("auth0|company-1")
                                .userType(UserType.company)
                                .build());

        companyRepository.save(createCompany(user, "Empresa Fantasia", "Empresa Razão Social"));

        mockMvc.perform(
                        get("/api/me/profile")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|company-1"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userType").value("company"))
                .andExpect(jsonPath("$.companyId").isNumber())
                .andExpect(jsonPath("$.companyName").value("Empresa Fantasia"));
    }

    @Test
    @DisplayName("GET /api/me/profile retorna companyName nulo para usuário sem empresa")
    void shouldReturnNullCompanyNameWhenCompanyIsMissing() throws Exception {
        User user =
                userRepository.save(
                        User.builder()
                                .name("Empresa Sem Cadastro")
                                .email("no-company@exemplo.com")
                                .auth0Id("auth0|company-2")
                                .userType(UserType.company)
                                .build());

        mockMvc.perform(
                        get("/api/me/profile")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|company-2"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userType").value("company"))
                .andExpect(jsonPath("$.companyId").value(nullValue()))
                .andExpect(jsonPath("$.companyName").value(nullValue()));
    }

    @Test
    @DisplayName("GET /api/me/profile retorna perfil vazio quando usuário não existe no banco")
    void shouldReturnEmptyProfileWhenUserDoesNotExist() throws Exception {
        mockMvc.perform(
                        get("/api/me/profile")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|missing"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.auth0Id").value("auth0|missing"))
                .andExpect(jsonPath("$.companyName").value(nullValue()));
    }

    private static Company createCompany(User user, String socialName, String legalName) {
        Company company = new Company();
        company.setUser(user);
        company.setSocialName(socialName);
        company.setLegalName(legalName);
        company.setCnpj("12345678000190");
        company.setPhone("(11) 99999-0000");
        return company;
    }
}
