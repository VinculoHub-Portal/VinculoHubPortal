/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.CompanyProjectId;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@ActiveProfiles("test")
@Transactional
class AdminExportControllerTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private NpoRepository npoRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private CompanyProjectRepository companyProjectRepository;

    private Company company;
    private Npo npo;
    private Project project;

    @BeforeEach
    void setup() {
        User companyUser =
                userRepository.save(
                        User.builder()
                                .name("Empresa")
                                .email("empresa@corp.com")
                                .auth0Id("auth0|company-export")
                                .userType(UserType.company)
                                .build());
        User npoUser =
                userRepository.save(
                        User.builder()
                                .name("ONG")
                                .email("contato@ong.org")
                                .auth0Id("auth0|npo-export")
                                .userType(UserType.npo)
                                .build());

        company = new Company();
        company.setSocialName("Corp S.A.");
        company.setLegalName("Corporation Ltda");
        company.setPhone("(11) 1111-1111");
        company.setUser(companyUser);
        company = companyRepository.save(company);

        npo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Boa")
                                .npoSize(NpoSize.small)
                                .phone("(11) 2222-2222")
                                .userId(npoUser.getId())
                                .build());

        project =
                projectRepository.save(
                        Project.builder()
                                .npo(npo)
                                .title("Projeto Verde")
                                .description("Projeto de reflorestamento")
                                .build());

        companyProjectRepository.save(
                CompanyProject.builder()
                        .id(new CompanyProjectId(company.getId(), project.getId()))
                        .company(company)
                        .project(project)
                        .status(RelationshipStatus.active)
                        .initiatorType(InitiatorType.company)
                        .build());
    }

    @Test
    @DisplayName("GET /api/admin/export/vinculos retorna vínculos para admin autenticado")
    void shouldExportVinculosWhenAuthenticatedAsAdmin() throws Exception {
        mockMvc.perform(
                        get("/api/admin/export/vinculos")
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))
                                                .jwt(jwt -> jwt.subject("auth0|admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("Corp S.A."))
                .andExpect(jsonPath("$[0].npoName").value("ONG Boa"))
                .andExpect(jsonPath("$[0].projectTitle").value("Projeto Verde"))
                .andExpect(jsonPath("$[0].status").value("active"));
    }
}
