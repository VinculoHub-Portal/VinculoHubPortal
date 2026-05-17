/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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
    @Autowired private ObjectMapper objectMapper;

    private Npo npo;
    private User userDono;
    private Ods ods1;
    private Ods ods3;
    private Ods ods5;

    @BeforeEach
    void setup() {
        projectRepository.deleteAll();
        npoRepository.deleteAll();
        userRepository.deleteAll();

        userDono = 
                userRepository.save(
                        User.builder()
                                .name("Dono ONG")
                                .email("dono@ong.com")
                                .auth0Id("auth0|dono")
                                .userType(UserType.npo)
                                .build());

        npo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Teste")
                                .npoSize(NpoSize.small)
                                .phone("(11) 9999-0000")
                                .environmental(true)
                                .userId(userDono.getId())
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
                        .focusArea("educacao")
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
                .andExpect(jsonPath("$.content[0].description").value("Descrição do projeto"))
                .andExpect(jsonPath("$.content[0].status").value("ACTIVE"))
                .andExpect(jsonPath("$.content[0].focusArea").value("educacao"))
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
                        .focusArea("educacao")
                        .status(ProjectStatus.ACTIVE)
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Completo")
                        .description("D")
                        .focusArea("educacao")
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
                Project.builder()
                        .npo(npo)
                        .title("Projeto Alpha")
                        .description("D")
                        .focusArea("educacao")
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Outro Projeto")
                        .description("D")
                        .focusArea("educacao")
                        .build());

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
                Project.builder()
                        .npo(npo)
                        .title("Meu Projeto")
                        .description("D")
                        .focusArea("educacao")
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(outraNpo)
                        .title("Outro Projeto")
                        .description("D")
                        .focusArea("educacao")
                        .build());

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
                        .focusArea("educacao")
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto ODS 5")
                        .description("D")
                        .ods(Set.of(ods5))
                        .focusArea("educacao")
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
    @DisplayName("GET /api/projects?type=CULTURAL filtra por tipo de projeto")
    void shouldFilterByProjectType() throws Exception {
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto Cultural")
                        .description("D")
                        .focusArea("educacao")
                        .type(ProjectType.CULTURAL)
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto Social")
                        .description("D")
                        .focusArea("educacao")
                        .type(ProjectType.SOCIAL)
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto Sem Tipo")
                        .description("D")
                        .focusArea("educacao")
                        .build());

        mockMvc.perform(
                        get("/api/projects?type=CULTURAL")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Projeto Cultural"));
    }

    @Test
    @DisplayName(
            "GET /api/projects?type=TAX_INCENTIVE_LAW mantém compatibilidade com tipos antigos")
    void shouldFilterByLegacyProjectType() throws Exception {
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto Lei de Incentivo")
                        .description("D")
                        .focusArea("educacao")
                        .type(ProjectType.TAX_INCENTIVE_LAW)
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto Social")
                        .description("D")
                        .focusArea("educacao")
                        .type(ProjectType.SOCIAL)
                        .build());

        mockMvc.perform(
                        get("/api/projects?type=TAX_INCENTIVE_LAW")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Projeto Lei de Incentivo"));
    }

    @Test
    @DisplayName("GET /api/projects/{id} retorna detalhe com os novos campos do projeto")
    void shouldReturnProjectDetailWithNewFields() throws Exception {
        Project project =
                projectRepository.save(
                        Project.builder()
                                .npo(npo)
                                .title("Projeto Detalhado")
                                .description("Descrição detalhada do projeto")
                                .status(ProjectStatus.ACTIVE)
                                .type(ProjectType.CULTURAL)
                                .budgetNeeded(java.math.BigDecimal.valueOf(120000))
                                .investedAmount(java.math.BigDecimal.valueOf(15000))
                                .focusArea("cultura")
                                .fundraisingDeadline("6 meses")
                                .beneficiariesCount(300)
                                .location("Porto Alegre, RS")
                                .mainObjective("Ampliar acesso à cultura.")
                                .ods(Set.of(ods1, ods3))
                                .startDate(LocalDate.of(2026, 1, 15))
                                .endDate(LocalDate.of(2026, 12, 15))
                                .build());

        mockMvc.perform(
                        get("/api/projects/" + project.getId())
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority(
                                                                "ROLE_COMPANY"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Projeto Detalhado"))
                .andExpect(jsonPath("$.type").value("CULTURAL"))
                .andExpect(jsonPath("$.focusArea").value("cultura"))
                .andExpect(jsonPath("$.fundraisingDeadline").value("6 meses"))
                .andExpect(jsonPath("$.beneficiariesCount").value(300))
                .andExpect(jsonPath("$.location").value("Porto Alegre, RS"))
                .andExpect(jsonPath("$.mainObjective").value("Ampliar acesso à cultura."));
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
    @DisplayName("DELETE /api/projects/{id} exclui o projeto com sucesso quando é o dono")
    void shouldDeleteProjectSuccessfully() throws Exception {
        Project project = 
                projectRepository.save(
                        Project.builder()
                                .npo(npo)
                                .title("Projeto a ser deletado")
                                .description("Descrição do projeto para teste")
                                .status(ProjectStatus.ACTIVE)
                                .build());

        mockMvc.perform(delete("/api/projects/" + project.getId())
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_NPO"))
                                   .jwt(jwt -> jwt.claim("sub", "auth0|dono"))))
                .andExpect(status().isNoContent()); 
        boolean exists = projectRepository.existsById(project.getId());
        assertFalse(exists, "O projeto deveria ter sido excluído");
    }

    @Test
    @DisplayName("DELETE /api/projects/{id} retorna 404 para projeto inexistente")
    void shouldReturn404WhenDeletingNonExistentProject() throws Exception {
        mockMvc.perform(delete("/api/projects/999999")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_NPO"))
                                   .jwt(jwt -> jwt.claim("sub", "auth0|dono"))))
                .andExpect(status().isNotFound());
    }



    @Test
    @DisplayName("DELETE /api/projects/{id} retorna 403 quando a ONG não é a dona")
    void shouldFailWhenDeletingProjectFromAnotherNpo() throws Exception {
        User userIntruso = 
                userRepository.save(
                        User.builder()
                                .name("Intruso")
                                .email("intruso@ong.com")
                                .auth0Id("auth0|outro_usuario")
                                .userType(UserType.npo)
                                .build());

        Npo outraNpo = 
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Intruso")
                                .npoSize(NpoSize.small)
                                .userId(userIntruso.getId())
                                .build()
        );

        Project project = 
                projectRepository.save(
                        Project.builder()
                                .npo(npo)
                                .title("Projeto do Dono A")
                                .description("Descrição do projeto do dono A")
                                .status(ProjectStatus.ACTIVE)
                                .build());
        mockMvc.perform(delete("/api/projects/" + project.getId())
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_NPO"))
                                   .jwt(jwt -> jwt.claim("sub", "auth0|outro_usuario")))) 
                .andExpect(status().isForbidden()); 
        assertTrue(projectRepository.existsById(project.getId()));
    }

    @Test
    @DisplayName("DELETE /api/projects/{id} sem autenticação retorna 401")
    void shouldReturn401WhenDeletingWithoutAuth() throws Exception {
        // Mesmo se o projeto existir, não deve passar pela segurança
        mockMvc.perform(delete("/api/projects/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/projects/{id}  com role incorreta retorna 403")
    void shouldReturn403WhenDeletingWithCompanyRole() throws Exception {
        // Setup projeto válido
        Project project = 
                projectRepository.save(
                        Project.builder()
                                .npo(npo)
                                .title("Projeto da ONG")
                                .description("Descrição restrita para deleção")
                                .status(ProjectStatus.ACTIVE)
                                .build());

        mockMvc.perform(delete("/api/projects/" + project.getId())
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_COMPANY"))))
                 .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));;
    }

    




    @Test
    @DisplayName("PUT /api/projects/{id} com sucesso retorna 200 com projeto atualizado")
    void shouldUpdateProjectSuccessfully() throws Exception {
        User user =
                userRepository.save(
                        User.builder().auth0Id("auth0|npo_owner").name("NPO Owner").build());
        Npo ownerNpo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Proprietária")
                                .npoSize(NpoSize.small)
                                .userId(user.getId())
                                .build());
        Project project =
                projectRepository.save(
                        Project.builder()
                                .npo(ownerNpo)
                                .title("Título Original")
                                .description(
                                        "Descrição original com pelo menos cinquenta caracteres"
                                                + " válidos.")
                                .status(ProjectStatus.ACTIVE)
                                .type(ProjectType.SOCIAL)
                                .budgetNeeded(BigDecimal.valueOf(1000))
                                .ods(Set.of(ods1))
                                .build());

        String updateRequestJson =
                objectMapper.writeValueAsString(
                        java.util.Map.of(
                                "title",
                                "Título Atualizado",
                                "description",
                                "Descrição atualizada com pelo menos cinquenta caracteres válidos e"
                                        + " completos.",
                                "budgetNeeded",
                                2000,
                                "type",
                                "CULTURAL",
                                "odsIds",
                                java.util.List.of(1, 3)));

        mockMvc.perform(
                        put("/api/projects/" + project.getId())
                                .with(
                                        jwt().jwt(jwt -> jwt.subject("auth0|npo_owner"))
                                                .authorities(
                                                        new SimpleGrantedAuthority("ROLE_NPO")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Título Atualizado"))
                .andExpect(jsonPath("$.type").value("CULTURAL"))
                .andExpect(jsonPath("$.budgetNeeded").value(2000));
    }

    @Test
    @DisplayName("PUT /api/projects/{id} com campos inválidos retorna 400")
    void shouldReturn400WhenUpdatingWithInvalidFields() throws Exception {
        User user =
                userRepository.save(
                        User.builder().auth0Id("auth0|npo_owner").name("NPO Owner").build());
        Npo ownerNpo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Proprietária")
                                .npoSize(NpoSize.small)
                                .userId(user.getId())
                                .build());
        Project project =
                projectRepository.save(
                        Project.builder()
                                .npo(ownerNpo)
                                .title("Título Original")
                                .description(
                                        "Descrição original com pelo menos cinquenta caracteres"
                                                + " válidos.")
                                .status(ProjectStatus.ACTIVE)
                                .type(ProjectType.SOCIAL)
                                .budgetNeeded(BigDecimal.valueOf(1000))
                                .ods(Set.of(ods1))
                                .build());

        String updateRequestJson =
                objectMapper.writeValueAsString(
                        java.util.Map.of(
                                "title",
                                "Ti",
                                "description",
                                "Curta",
                                "budgetNeeded",
                                -1000,
                                "type",
                                "CULTURAL",
                                "odsIds",
                                java.util.List.of()));

        mockMvc.perform(
                        put("/api/projects/" + project.getId())
                                .with(
                                        jwt().jwt(jwt -> jwt.subject("auth0|npo_owner"))
                                                .authorities(
                                                        new SimpleGrantedAuthority("ROLE_NPO")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("PUT /api/projects/{id} inexistente retorna 404")
    void shouldReturn404WhenUpdatingNonExistentProject() throws Exception {
        User user =
                userRepository.save(
                        User.builder().auth0Id("auth0|npo_owner").name("NPO Owner").build());
        npoRepository.save(
                Npo.builder()
                        .name("ONG Proprietária")
                        .npoSize(NpoSize.small)
                        .userId(user.getId())
                        .build());

        String updateRequestJson =
                objectMapper.writeValueAsString(
                        java.util.Map.of(
                                "title",
                                "Título Novo",
                                "description",
                                "Descrição nova com pelo menos cinquenta caracteres válidos.",
                                "budgetNeeded",
                                2000,
                                "type",
                                "CULTURAL",
                                "odsIds",
                                java.util.List.of(1)));

        mockMvc.perform(
                        put("/api/projects/99999")
                                .with(
                                        jwt().jwt(jwt -> jwt.subject("auth0|npo_owner"))
                                                .authorities(
                                                        new SimpleGrantedAuthority("ROLE_NPO")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequestJson))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("PUT /api/projects/{id} por ONG não proprietária retorna 403")
    void shouldReturn403WhenNpoIsNotOwner() throws Exception {
        User ownerUser =
                userRepository.save(
                        User.builder().auth0Id("auth0|npo_owner").name("NPO Owner").build());
        User otherUser =
                userRepository.save(
                        User.builder().auth0Id("auth0|other_npo").name("Other NPO").build());

        Npo ownerNpo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Proprietária")
                                .npoSize(NpoSize.small)
                                .userId(ownerUser.getId())
                                .build());
        Npo otherNpo =
                npoRepository.save(
                        Npo.builder()
                                .name("Outra ONG")
                                .npoSize(NpoSize.small)
                                .userId(otherUser.getId())
                                .build());

        Project project =
                projectRepository.save(
                        Project.builder()
                                .npo(ownerNpo)
                                .title("Projeto da ONG Proprietária")
                                .description(
                                        "Descrição original com pelo menos cinquenta caracteres"
                                                + " válidos.")
                                .status(ProjectStatus.ACTIVE)
                                .type(ProjectType.SOCIAL)
                                .budgetNeeded(BigDecimal.valueOf(1000))
                                .ods(Set.of(ods1))
                                .build());

        String updateRequestJson =
                objectMapper.writeValueAsString(
                        java.util.Map.of(
                                "title",
                                "Título Novo",
                                "description",
                                "Descrição nova com pelo menos cinquenta caracteres válidos.",
                                "budgetNeeded",
                                2000,
                                "type",
                                "CULTURAL",
                                "odsIds",
                                java.util.List.of(1)));

        mockMvc.perform(
                        put("/api/projects/" + project.getId())
                                .with(
                                        jwt().jwt(jwt -> jwt.subject("auth0|other_npo"))
                                                .authorities(
                                                        new SimpleGrantedAuthority("ROLE_NPO")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequestJson))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("PUT /api/projects/{id} sem autenticação retorna 401")
    void shouldReturn401WhenUpdatingWithoutAuth() throws Exception {
        String updateRequestJson =
                objectMapper.writeValueAsString(
                        java.util.Map.of(
                                "title",
                                "Título Novo",
                                "description",
                                "Descrição nova com pelo menos cinquenta caracteres válidos.",
                                "budgetNeeded",
                                2000,
                                "type",
                                "CULTURAL",
                                "odsIds",
                                java.util.List.of(1)));

        mockMvc.perform(
                        put("/api/projects/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequestJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/projects/{id} com papel ROLE_COMPANY retorna 403")
    void shouldReturn403WhenUpdatingWithWrongRole() throws Exception {
        User user =
                userRepository.save(
                        User.builder().auth0Id("auth0|company").name("Company User").build());
        npoRepository.save(
                Npo.builder()
                        .name("ONG Teste")
                        .npoSize(NpoSize.small)
                        .userId(user.getId())
                        .build());

        String updateRequestJson =
                objectMapper.writeValueAsString(
                        java.util.Map.of(
                                "title",
                                "Título Novo",
                                "description",
                                "Descrição nova com pelo menos cinquenta caracteres válidos.",
                                "budgetNeeded",
                                2000,
                                "type",
                                "CULTURAL",
                                "odsIds",
                                java.util.List.of(1)));

        mockMvc.perform(
                        put("/api/projects/1")
                                .with(
                                        jwt().jwt(jwt -> jwt.subject("auth0|company"))
                                                .authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequestJson))
                .andExpect(status().isForbidden());
    }
}
