/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@ActiveProfiles("test")
@Transactional
class RelationshipControllerTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private NpoRepository npoRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private CompanyProjectRepository companyProjectRepository;

    private static final String COMPANY_SUB = "auth0|company";
    private static final String NPO_SUB = "auth0|npo";

    private Company company;
    private Npo npo;
    private Project project;

    @BeforeEach
    void setup() {
        // The test runs in a transaction that rolls back, so no manual cleanup is needed and we
        // avoid FK clashes with soft-deleted rows left by other tests on the shared container.
        User companyUser =
                userRepository.save(
                        User.builder()
                                .name("Empresa")
                                .email("empresa@corp.com")
                                .auth0Id(COMPANY_SUB)
                                .userType(UserType.company)
                                .build());
        User npoUser =
                userRepository.save(
                        User.builder()
                                .name("ONG")
                                .email("contato@ong.org")
                                .auth0Id(NPO_SUB)
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
    }

    private CompanyProject seedRelationship(RelationshipStatus status, InitiatorType initiator) {
        return companyProjectRepository.save(
                CompanyProject.builder()
                        .id(new CompanyProjectId(company.getId(), project.getId()))
                        .company(company)
                        .project(project)
                        .status(status)
                        .initiatorType(initiator)
                        .build());
    }

    private static org.springframework.test.web.servlet.request.RequestPostProcessor as(
            String subject) {
        return jwt().jwt(j -> j.subject(subject))
                .authorities(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Test
    @DisplayName("VNC-01: requer autenticação (401 sem token)")
    void listRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/relationships")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("VNC-02→04: ciclo completo empresa/ONG até status active")
    void fullLifecycle() throws Exception {
        // VNC-02: empresa demonstra interesse no projeto.
        mockMvc.perform(
                        post("/api/relationships")
                                .with(as(COMPANY_SUB))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"projectId\":" + project.getId() + "}"))
                .andExpect(status().isCreated());

        assertEquals(
                RelationshipStatus.pending,
                companyProjectRepository
                        .findByIdWithGraph(company.getId(), project.getId())
                        .orElseThrow()
                        .getStatus());

        // ONG vê o vínculo pendente, sem contato revelado, podendo responder.
        mockMvc.perform(get("/api/relationships?status=pending").with(as(NPO_SUB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectId").value(project.getId()))
                .andExpect(jsonPath("$[0].status").value("pending"))
                .andExpect(jsonPath("$[0].canRespond").value(true))
                .andExpect(jsonPath("$[0].partnerContactEmail").doesNotExist());

        // VNC-03: ONG (receptora) aceita -> negotiation + contato revelado.
        mockMvc.perform(
                        post("/api/relationships/"
                                        + company.getId()
                                        + "/"
                                        + project.getId()
                                        + "/accept")
                                .with(as(NPO_SUB)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/relationships").with(as(COMPANY_SUB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("negotiation"))
                .andExpect(jsonPath("$[0].partnerContactEmail").value("contato@ong.org"))
                .andExpect(jsonPath("$[0].partnerContactPhone").value("(11) 2222-2222"))
                .andExpect(jsonPath("$[0].canConfirm").value(true));

        // VNC-04: ambas as partes efetivam -> active.
        String confirmUrl =
                "/api/relationships/" + company.getId() + "/" + project.getId() + "/confirm";
        mockMvc.perform(post(confirmUrl).with(as(COMPANY_SUB))).andExpect(status().isOk());
        // ainda em negociação após apenas uma confirmação
        assertEquals(
                RelationshipStatus.negotiation,
                companyProjectRepository
                        .findByIdWithGraph(company.getId(), project.getId())
                        .orElseThrow()
                        .getStatus());

        mockMvc.perform(post(confirmUrl).with(as(NPO_SUB))).andExpect(status().isOk());
        assertEquals(
                RelationshipStatus.active,
                companyProjectRepository
                        .findByIdWithGraph(company.getId(), project.getId())
                        .orElseThrow()
                        .getStatus());
    }

    @Test
    @DisplayName("VNC-03: recusar encerra o vínculo (some da listagem visível)")
    void rejectClosesRelationship() throws Exception {
        seedRelationship(RelationshipStatus.pending, InitiatorType.company);

        mockMvc.perform(
                        post("/api/relationships/"
                                        + company.getId()
                                        + "/"
                                        + project.getId()
                                        + "/reject")
                                .with(as(NPO_SUB)))
                .andExpect(status().isOk());

        assertEquals(
                RelationshipStatus.inactive,
                companyProjectRepository
                        .findByIdWithGraph(company.getId(), project.getId())
                        .orElseThrow()
                        .getStatus());

        mockMvc.perform(get("/api/relationships").with(as(NPO_SUB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("VNC-03: iniciador não pode aceitar o próprio interesse (403)")
    void initiatorCannotAccept() throws Exception {
        seedRelationship(RelationshipStatus.pending, InitiatorType.company);

        mockMvc.perform(
                        post("/api/relationships/"
                                        + company.getId()
                                        + "/"
                                        + project.getId()
                                        + "/accept")
                                .with(as(COMPANY_SUB)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("VNC-02/03: ONG inicia (Propor Parceria) e a empresa receptora aceita")
    void npoInitiatesAndCompanyAccepts() throws Exception {
        // VNC-02: ONG propõe parceria informando projeto próprio + empresa alvo.
        mockMvc.perform(
                        post("/api/relationships")
                                .with(as(NPO_SUB))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"projectId\":"
                                                + project.getId()
                                                + ",\"companyId\":"
                                                + company.getId()
                                                + "}"))
                .andExpect(status().isCreated());

        // A empresa é a receptora (initiator = npo): vê o pendente e pode responder.
        mockMvc.perform(get("/api/relationships?status=pending").with(as(COMPANY_SUB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("pending"))
                .andExpect(jsonPath("$[0].canRespond").value(true))
                .andExpect(jsonPath("$[0].partnerInstitutionName").value("ONG Boa"));

        // VNC-03: empresa aceita -> negotiation.
        mockMvc.perform(
                        post("/api/relationships/"
                                        + company.getId()
                                        + "/"
                                        + project.getId()
                                        + "/accept")
                                .with(as(COMPANY_SUB)))
                .andExpect(status().isOk());

        assertEquals(
                RelationshipStatus.negotiation,
                companyProjectRepository
                        .findByIdWithGraph(company.getId(), project.getId())
                        .orElseThrow()
                        .getStatus());
    }
}
