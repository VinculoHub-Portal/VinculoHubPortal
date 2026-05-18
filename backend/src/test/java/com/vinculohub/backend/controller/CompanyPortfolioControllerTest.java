/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
class CompanyPortfolioControllerTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private NpoRepository npoRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JdbcTemplate jdbcTemplate;

    private static final String AUTH0_ID = "auth0|company-dashboard";

    private Company company;

    @BeforeEach
    void setup() {
        jdbcTemplate.update("DELETE FROM company_project");
        projectRepository.deleteAll();
        companyRepository.deleteAll();
        npoRepository.deleteAll();
        userRepository.deleteAll();

        User companyUser =
                userRepository.save(
                        User.builder()
                                .name("Empresa Teste")
                                .email("empresa-dashboard@test.com")
                                .auth0Id(AUTH0_ID)
                                .userType(UserType.company)
                                .build());

        company = new Company();
        company.setLegalName("Empresa Teste LTDA");
        company.setSocialName("Empresa Teste");
        company.setCnpj("11222333000181");
        company.setUser(companyUser);
        company = companyRepository.save(company);
    }

    @Test
    @DisplayName("GET /api/me/company/portfolio/esg-impact retorna métricas agregadas")
    void shouldReturnEsgImpactDashboard() throws Exception {
        Npo npo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Ambiental")
                                .npoSize(NpoSize.small)
                                .environmental(true)
                                .social(true)
                                .build());

        Project project =
                projectRepository.save(
                        Project.builder()
                                .npo(npo)
                                .title("Projeto Verde")
                                .description("Descrição do projeto com foco ambiental e social.")
                                .status(ProjectStatus.ACTIVE)
                                .budgetNeeded(new BigDecimal("5000.00"))
                                .investedAmount(new BigDecimal("3000.00"))
                                .build());

        jdbcTemplate.update(
                "INSERT INTO company_project (company_id, project_id, status) VALUES (?, ?,"
                        + " 'active'::relationship_status)",
                company.getId(),
                project.getId());

        mockMvc.perform(
                        get("/api/me/company/portfolio/esg-impact")
                                .with(
                                        jwt().jwt(
                                                        jwt ->
                                                                jwt.subject(AUTH0_ID)
                                                                        .claim(
                                                                                "email",
                                                                                "empresa-dashboard@test.com"))
                                                .authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectCount").value(1))
                .andExpect(jsonPath("$.totalInvested").value(3000.00))
                .andExpect(jsonPath("$.totalBudgetNeeded").value(5000.00))
                .andExpect(jsonPath("$.pillars").isArray())
                .andExpect(jsonPath("$.pillars[0].pillar").value("ENVIRONMENTAL"))
                .andExpect(jsonPath("$.pillars[0].label").value("Ambiental"))
                .andExpect(jsonPath("$.pillars[0].projectCount").value(1))
                .andExpect(jsonPath("$.pillars[0].totalInvested").value(3000.00))
                .andExpect(jsonPath("$.pillars[0].budgetNeeded").value(5000.00))
                .andExpect(jsonPath("$.pillars[0].investmentPercentage").value(100.00))
                .andExpect(jsonPath("$.pillars[1].pillar").value("SOCIAL"))
                .andExpect(jsonPath("$.pillars[1].projectCount").value(1))
                .andExpect(jsonPath("$.pillars[2].pillar").value("GOVERNANCE"))
                .andExpect(jsonPath("$.pillars[2].projectCount").value(0));
    }

    @Test
    @DisplayName("GET /api/me/company/portfolio/esg-impact retorna zeros sem projetos vinculados")
    void shouldReturnZerosWhenPortfolioIsEmpty() throws Exception {
        mockMvc.perform(
                        get("/api/me/company/portfolio/esg-impact")
                                .with(
                                        jwt().jwt(
                                                        jwt ->
                                                                jwt.subject(AUTH0_ID)
                                                                        .claim(
                                                                                "email",
                                                                                "empresa-dashboard@test.com"))
                                                .authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectCount").value(0))
                .andExpect(jsonPath("$.totalInvested").value(0))
                .andExpect(jsonPath("$.totalBudgetNeeded").value(0))
                .andExpect(jsonPath("$.pillars[0].projectCount").value(0))
                .andExpect(jsonPath("$.pillars[1].projectCount").value(0))
                .andExpect(jsonPath("$.pillars[2].projectCount").value(0));
    }
}
