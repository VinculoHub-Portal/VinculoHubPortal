/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.OdsRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
class ProjectControllerTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private NpoRepository npoRepository;
    @Autowired private OdsRepository odsRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JdbcTemplate jdbcTemplate;

    private Npo npo;
    private Ods ods1;
    private Ods ods3;
    private Ods ods5;

    @BeforeEach
    void setup() {
        projectRepository.deleteAll();
        npoRepository.deleteAll();
        userRepository.deleteAll();
        npo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Teste")
                                .npoSize(NpoSize.small)
                                .phone("(11) 9999-0000")
                                .environmental(true)
                                .build());
        ods1 = odsRepository.findById(1).orElseThrow();
        ods3 = odsRepository.findById(3).orElseThrow();
        ods5 = odsRepository.findById(5).orElseThrow();
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
                        .ods(Set.of(ods1, ods3))
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto ODS 5")
                        .description("D")
                        .ods(Set.of(ods5))
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
                Project.builder().npo(npo).title("Projeto Sem Tipo").description("D").build());

        mockMvc.perform(
                        get("/api/projects?type=TAX_INCENTIVE_LAW")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Projeto Lei de Incentivo Fiscal"));
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

    @Test
    @DisplayName("POST /api/projects cria projeto para ONG autenticada")
    void shouldCreateProjectForAuthenticatedNpo() throws Exception {
        User user =
                userRepository.save(
                        User.builder()
                                .name("Usuário ONG")
                                .email("npo@teste.com")
                                .auth0Id("auth0|npo")
                                .userType(UserType.npo)
                                .build());
        Npo authenticatedNpo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Autenticada")
                                .userId(user.getId())
                                .npoSize(NpoSize.small)
                                .environmental(true)
                                .build());

        String body =
                """
                {
                  "name": "Projeto Novo",
                  "description": "Descrição do projeto novo",
                  "type": "TAX_INCENTIVE_LAW",
                  "capital": 25000,
                  "ods": ["4", "10"]
                }
                """;

        mockMvc.perform(
                        post("/api/projects")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                                .with(
                                        jwt().jwt(jwt -> jwt.subject("auth0|npo"))
                                                .authorities(
                                                        new SimpleGrantedAuthority("ROLE_NPO"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Projeto Novo"))
                .andExpect(jsonPath("$.description").value("Descrição do projeto novo"))
                .andExpect(jsonPath("$.type").value("TAX_INCENTIVE_LAW"))
                .andExpect(jsonPath("$.capital").value(25000))
                .andExpect(jsonPath("$.npoId").value(authenticatedNpo.getId()));

        List<Project> savedProjects = projectRepository.findAll();
        Project savedProject =
                savedProjects.stream()
                        .filter(project -> project.getTitle().equals("Projeto Novo"))
                        .findFirst()
                        .orElseThrow();

        org.assertj.core.api.Assertions.assertThat(savedProject.getNpo().getId())
                .isEqualTo(authenticatedNpo.getId());
        org.assertj.core.api.Assertions.assertThat(savedProject.getType())
                .isEqualTo(ProjectType.TAX_INCENTIVE_LAW);
        org.assertj.core.api.Assertions.assertThat(savedProject.getBudgetNeeded())
                .isEqualByComparingTo(new BigDecimal("25000"));

        Integer odsCount =
                jdbcTemplate.queryForObject(
                        "select count(*) from project_ods where project_id = ?",
                        Integer.class,
                        savedProject.getId());
        org.assertj.core.api.Assertions.assertThat(odsCount).isEqualTo(2);
    }

    @Test
    @DisplayName("POST /api/projects retorna 404 quando usuário não possui ONG")
    void shouldReturn404WhenAuthenticatedUserHasNoNpo() throws Exception {
        userRepository.save(
                User.builder()
                        .name("Usuário ONG")
                        .email("npo-sem-ong@teste.com")
                        .auth0Id("auth0|npo-sem-ong")
                        .userType(UserType.npo)
                        .build());

        String body =
                """
                {
                  "name": "Projeto Novo",
                  "description": "Descrição do projeto novo",
                  "type": "SOCIAL_INVESTMENT_LAW",
                  "capital": null,
                  "ods": ["1"]
                }
                """;

        mockMvc.perform(
                        post("/api/projects")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                                .with(
                                        jwt().jwt(jwt -> jwt.subject("auth0|npo-sem-ong"))
                                                .authorities(
                                                        new SimpleGrantedAuthority("ROLE_NPO"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("POST /api/projects sem papel NPO retorna 403")
    void shouldReturn403WhenCreatingProjectWithoutNpoRole() throws Exception {
        String body =
                """
                {
                  "name": "Projeto Novo",
                  "description": "Descrição do projeto novo",
                  "type": "SOCIAL_INVESTMENT_LAW",
                  "capital": null,
                  "ods": ["1"]
                }
                """;

        mockMvc.perform(
                        post("/api/projects")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                                .with(
                                        jwt().jwt(jwt -> jwt.subject("auth0|company"))
                                                .authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isForbidden());
    }
}
