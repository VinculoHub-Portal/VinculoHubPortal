/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoReportRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

class NpoReportControllerTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private NpoRepository npoRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private NpoReportRepository npoReportRepository;

    @BeforeEach
    void setup() {
        jdbcTemplate.update("DELETE FROM npo_report");
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
    @DisplayName("POST /api/npos/{id}/reports cria denúncia quando autenticado como empresa")
    void shouldCreateReportWhenAuthenticatedAsCompany() throws Exception {
        User companyUser = saveCompanyUser("auth0|company");
        Company company = saveCompany(companyUser);
        Npo npo = saveNpo();
        String reason = "Documentos da ONG parecem inconsistentes com o projeto divulgado.";

        mockMvc.perform(
                        post("/api/npos/" + npo.getId() + "/reports")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of("reason", reason)))
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|company"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.npo.id").value(npo.getId()))
                .andExpect(jsonPath("$.reporterCompany.id").value(company.getId()))
                .andExpect(jsonPath("$.reporterUser.id").value(companyUser.getId()))
                .andExpect(jsonPath("$.reason").value(reason))
                .andExpect(jsonPath("$.status").value("OPEN"));

        var savedReports = npoReportRepository.findAll();
        org.assertj.core.api.Assertions.assertThat(savedReports).hasSize(1);
        org.assertj.core.api.Assertions.assertThat(savedReports.get(0).getNpo().getId())
                .isEqualTo(npo.getId());
        org.assertj.core.api.Assertions.assertThat(savedReports.get(0).getReporterCompany().getId())
                .isEqualTo(company.getId());
    }

    @Test
    @DisplayName("GET /api/admin/npo-reports lista denúncias para admin")
    void shouldListReportsForAdmin() throws Exception {
        User companyUser = saveCompanyUser("auth0|company-admin-list");
        Company company = saveCompany(companyUser);
        Npo npo = saveNpo();
        npoReportRepository.save(
                com.vinculohub.backend.model.NpoReport.builder()
                        .npo(npo)
                        .reporterCompany(company)
                        .reporterUser(companyUser)
                        .reason("A ONG não apresentou comprovantes suficientes.")
                        .build());

        mockMvc.perform(
                        get("/api/admin/npo-reports")
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))
                                                .jwt(jwt -> jwt.subject("auth0|admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].npo.name").value("ONG Reportada"))
                .andExpect(
                        jsonPath("$.content[0].reporterCompany.name").value("Empresa Denunciante"))
                .andExpect(jsonPath("$.content[0].reporterUser.email").value("empresa@example.com"))
                .andExpect(
                        jsonPath("$.content[0].reason")
                                .value("A ONG não apresentou comprovantes suficientes."))
                .andExpect(jsonPath("$.content[0].status").value("OPEN"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    @DisplayName("POST /api/npos/{id}/reports sem autenticação retorna 401")
    void shouldReturn401WithoutAuthentication() throws Exception {
        Npo npo = saveNpo();

        mockMvc.perform(
                        post("/api/npos/" + npo.getId() + "/reports")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of("reason", "Motivo válido para análise."))))
                .andExpect(status().isUnauthorized());

        org.assertj.core.api.Assertions.assertThat(npoReportRepository.count()).isZero();
    }

    @Test
    @DisplayName("POST /api/npos/{id}/reports bloqueia usuários que não são empresa")
    void shouldReturn403WhenRoleIsNotCompany() throws Exception {
        Npo npo = saveNpo();

        mockMvc.perform(
                        post("/api/npos/" + npo.getId() + "/reports")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of("reason", "Motivo válido para análise.")))
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_NPO"))
                                                .jwt(jwt -> jwt.subject("auth0|npo"))))
                .andExpect(status().isForbidden());

        org.assertj.core.api.Assertions.assertThat(npoReportRepository.count()).isZero();
    }

    @Test
    @DisplayName("POST /api/npos/{id}/reports retorna 404 quando empresa não existe")
    void shouldReturn404WhenCompanyProfileDoesNotExist() throws Exception {
        userRepository.save(
                User.builder()
                        .name("Empresa sem perfil")
                        .email("sem-perfil@example.com")
                        .auth0Id("auth0|company-no-profile")
                        .userType(UserType.company)
                        .build());
        Npo npo = saveNpo();

        mockMvc.perform(
                        post("/api/npos/" + npo.getId() + "/reports")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of("reason", "Motivo válido para análise.")))
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(
                                                        jwt ->
                                                                jwt.subject(
                                                                        "auth0|company-no-profile"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Empresa não encontrada."));

        org.assertj.core.api.Assertions.assertThat(npoReportRepository.count()).isZero();
    }

    @Test
    @DisplayName("POST /api/npos/{id}/reports retorna 404 quando ONG não existe")
    void shouldReturn404WhenNpoDoesNotExist() throws Exception {
        saveCompany(saveCompanyUser("auth0|company-npo-missing"));

        mockMvc.perform(
                        post("/api/npos/999999/reports")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of("reason", "Motivo válido para análise.")))
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(
                                                        jwt ->
                                                                jwt.subject(
                                                                        "auth0|company-npo-missing"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("ONG não encontrada."));

        org.assertj.core.api.Assertions.assertThat(npoReportRepository.count()).isZero();
    }

    @Test
    @DisplayName("POST /api/npos/{id}/reports valida motivo obrigatório")
    void shouldValidateReason() throws Exception {
        saveCompany(saveCompanyUser("auth0|company-invalid-reason"));
        Npo npo = saveNpo();

        mockMvc.perform(
                        post("/api/npos/" + npo.getId() + "/reports")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of("reason", "curto")))
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(
                                                        jwt ->
                                                                jwt.subject(
                                                                        "auth0|company-invalid-reason"))))
                .andExpect(status().isBadRequest());

        org.assertj.core.api.Assertions.assertThat(npoReportRepository.count()).isZero();
    }

    @Test
    @DisplayName("GET /api/admin/npo-reports bloqueia empresa")
    void shouldReturn403WhenCompanyListsAdminReports() throws Exception {
        mockMvc.perform(
                        get("/api/admin/npo-reports")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|company"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /api/admin/npo-reports/{id}/status atualiza status para admin")
    void shouldUpdateReportStatusForAdmin() throws Exception {
        User companyUser = saveCompanyUser("auth0|company-status");
        Company company = saveCompany(companyUser);
        Npo npo = saveNpo();
        var report =
                npoReportRepository.save(
                        com.vinculohub.backend.model.NpoReport.builder()
                                .npo(npo)
                                .reporterCompany(company)
                                .reporterUser(companyUser)
                                .reason("A ONG não apresentou comprovantes suficientes.")
                                .build());

        mockMvc.perform(
                        patch("/api/admin/npo-reports/" + report.getId() + "/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of("status", "RESOLVED")))
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))
                                                .jwt(jwt -> jwt.subject("auth0|admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(report.getId()))
                .andExpect(jsonPath("$.status").value("RESOLVED"));

        var savedReport = npoReportRepository.findById(report.getId()).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(savedReport.getStatus().name())
                .isEqualTo("RESOLVED");
    }

    @Test
    @DisplayName("PATCH /api/admin/npo-reports/{id}/status bloqueia empresa")
    void shouldReturn403WhenCompanyUpdatesReportStatus() throws Exception {
        mockMvc.perform(
                        patch("/api/admin/npo-reports/1/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of("status", "RESOLVED")))
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|company"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /api/admin/npo-reports/{id}/status retorna 404 para denúncia inexistente")
    void shouldReturn404WhenUpdatingMissingReportStatus() throws Exception {
        mockMvc.perform(
                        patch("/api/admin/npo-reports/999999/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of("status", "DISMISSED")))
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))
                                                .jwt(jwt -> jwt.subject("auth0|admin"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Denúncia não encontrada."));
    }

    private User saveCompanyUser(String auth0Id) {
        return userRepository.save(
                User.builder()
                        .name("Usuário Empresa")
                        .email("empresa@example.com")
                        .auth0Id(auth0Id)
                        .userType(UserType.company)
                        .build());
    }

    private Company saveCompany(User user) {
        Company company = new Company();
        company.setLegalName("Empresa Denunciante LTDA");
        company.setSocialName("Empresa Denunciante");
        company.setCnpj("12345678000199");
        company.setUser(user);
        return companyRepository.save(company);
    }

    private Npo saveNpo() {
        return npoRepository.save(
                Npo.builder().name("ONG Reportada").npoSize(NpoSize.small).build());
    }
}
