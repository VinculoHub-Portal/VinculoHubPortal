/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import java.time.LocalDate;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
class ProjectControllerTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private NpoRepository npoRepository;

    private Npo npo;

    @BeforeEach
    void setup() {
        projectRepository.deleteAll();
        npoRepository.deleteAll();
        npo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Teste")
                                .npoSize(NpoSize.small)
                                .phone("(11) 9999-0000")
                                .environmental(true)
                                .build());
    }

    @Test
    @DisplayName("GET /api/projects retorna 200 com lista paginada")
    void shouldReturn200WithPagedList() throws Exception {
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto Alpha")
                        .description("Descrição do projeto")
                        .status(ProjectStatus.ACTIVE)
                        .startDate(LocalDate.of(2026, 1, 15))
                        .build());

        mockMvc.perform(
                        get("/api/projects")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Projeto Alpha"))
                .andExpect(jsonPath("$.content[0].status").value("ACTIVE"))
                .andExpect(jsonPath("$.content[0].npoName").value("ONG Teste"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/projects retorna 200 com lista vazia quando não há projetos")
    void shouldReturn200WithEmptyListWhenNoProjects() throws Exception {
        mockMvc.perform(
                        get("/api/projects")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("GET /api/projects?status=ACTIVE filtra por status")
    void shouldFilterByStatus() throws Exception {
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Ativo")
                        .description("D")
                        .status(ProjectStatus.ACTIVE)
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Completo")
                        .description("D")
                        .status(ProjectStatus.COMPLETED)
                        .build());

        mockMvc.perform(
                        get("/api/projects?status=ACTIVE")
                                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_NPO"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].status").value("ACTIVE"));
    }

    @Test
    @DisplayName("GET /api/projects?title=alpha filtra por título (case-insensitive)")
    void shouldFilterByTitle() throws Exception {
        projectRepository.save(
                Project.builder().npo(npo).title("Projeto Alpha").description("D").build());
        projectRepository.save(
                Project.builder().npo(npo).title("Outro Projeto").description("D").build());

        mockMvc.perform(
                        get("/api/projects?title=ALPHA")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Projeto Alpha"));
    }

    @Test
    @DisplayName("GET /api/projects?npoId filtra por ONG")
    void shouldFilterByNpoId() throws Exception {
        Npo outraNpo =
                npoRepository.save(
                        Npo.builder()
                                .name("Outra ONG")
                                .npoSize(NpoSize.small)
                                .environmental(false)
                                .build());
        projectRepository.save(
                Project.builder().npo(npo).title("Meu Projeto").description("D").build());
        projectRepository.save(
                Project.builder().npo(outraNpo).title("Outro Projeto").description("D").build());

        mockMvc.perform(
                        get("/api/projects?npoId=" + npo.getId())
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Meu Projeto"));
    }

    @Test
    @DisplayName("GET /api/projects?status=INVALIDO retorna 400")
    void shouldReturn400ForInvalidStatus() throws Exception {
        mockMvc.perform(
                        get("/api/projects?status=INVALIDO")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("GET /api/projects?odsCodes=1,3 filtra por códigos ODS")
    void shouldFilterByOdsCodes() throws Exception {
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto ODS 1 e 3")
                        .description("D")
                        .odsCodes(Set.of(1, 3))
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto ODS 5")
                        .description("D")
                        .odsCodes(Set.of(5))
                        .build());

        mockMvc.perform(
                        get("/api/projects?odsCodes=1&odsCodes=3")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Projeto ODS 1 e 3"));
    }

    @Test
    @DisplayName("GET /api/projects?type=TAX_INCENTIVE_LAW filtra por tipo de projeto")
    void shouldFilterByProjectType() throws Exception {
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto Lei de Incentivo Fiscal")
                        .description("D")
                        .type(ProjectType.TAX_INCENTIVE_LAW)
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto Lei de Investimento Social")
                        .description("D")
                        .type(ProjectType.SOCIAL_INVESTMENT_LAW)
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto Sem Tipo")
                        .description("D")
                        .build());

        mockMvc.perform(
                        get("/api/projects?type=TAX_INCENTIVE_LAW")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(
                        jsonPath("$.content[0].title").value("Projeto Lei de Incentivo Fiscal"));
    }

    @Test
    @DisplayName("GET /api/projects?type=INVALIDO retorna 400")
    void shouldReturn400ForInvalidType() throws Exception {
        mockMvc.perform(
                        get("/api/projects?type=INVALIDO")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("GET /api/projects sem autenticação retorna 401")
    void shouldReturn401WithoutAuth() throws Exception {
        mockMvc.perform(get("/api/projects")).andExpect(status().isUnauthorized());
    }
}
