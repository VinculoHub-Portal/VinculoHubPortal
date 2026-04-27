/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

class ProjectControllerIntegrationTest extends AbstractIntegrationTest {

    private static final String NPO_AUTH0 = "auth0|npo-1";
    private static final String COMPANY_AUTH0 = "auth0|company-1";
    private static final String LONELY_AUTH0 = "auth0|no-org";

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanAndSeed() {
        jdbcTemplate.update("DELETE FROM company_project");
        jdbcTemplate.update("DELETE FROM project");
        jdbcTemplate.update("DELETE FROM company");
        jdbcTemplate.update("DELETE FROM npo");
        jdbcTemplate.update("DELETE FROM users");

        Integer npoUserId =
                jdbcTemplate.queryForObject(
                        "INSERT INTO users (name, email, auth0_id, user_type) VALUES ('ONG User',"
                                + " 'ong@test.com', ?, 'npo'::user_type) RETURNING id",
                        Integer.class,
                        NPO_AUTH0);
        Integer npoId =
                jdbcTemplate.queryForObject(
                        "INSERT INTO npo (name, user_id, npo_size) "
                                + "VALUES ('ONG Teste', ?, 'small'::npo_size) RETURNING id",
                        Integer.class,
                        npoUserId);
        jdbcTemplate.update(
                "INSERT INTO project (npo_id, title, status) VALUES "
                        + "(?, 'P-Active', 'active'::project_status), "
                        + "(?, 'P-Completed', 'completed'::project_status), "
                        + "(?, 'P-Cancelled', 'cancelled'::project_status)",
                npoId,
                npoId,
                npoId);

        Integer companyUserId =
                jdbcTemplate.queryForObject(
                        "INSERT INTO users (name, email, auth0_id, user_type) VALUES ('Empresa"
                            + " User', 'empresa@test.com', ?, 'company'::user_type) RETURNING id",
                        Integer.class,
                        COMPANY_AUTH0);
        Integer companyId =
                jdbcTemplate.queryForObject(
                        "INSERT INTO company (legal_name, social_name, user_id) "
                                + "VALUES ('Empresa LTDA', 'Empresa', ?) RETURNING id",
                        Integer.class,
                        companyUserId);
        Integer activeProjectId =
                jdbcTemplate.queryForObject(
                        "SELECT id FROM project WHERE title = 'P-Active'", Integer.class);
        jdbcTemplate.update(
                "INSERT INTO company_project (company_id, project_id, status) "
                        + "VALUES (?, ?, 'active'::relationship_status)",
                companyId,
                activeProjectId);

        jdbcTemplate.update(
                "INSERT INTO users (name, email, auth0_id, user_type) "
                        + "VALUES ('Sem Org', 'lonely@test.com', ?, 'npo'::user_type)",
                LONELY_AUTH0);
    }

    @Test
    @DisplayName("GET /api/projects sem JWT retorna 401")
    void unauthorizedWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/projects")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("NPO autenticado sem filtro retorna seus 3 projetos")
    void npoListsAllOwnProjects() throws Exception {
        mockMvc.perform(get("/api/projects").with(jwt().jwt(j -> j.subject(NPO_AUTH0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(3)))
                .andExpect(
                        jsonPath(
                                "$[*].title",
                                Matchers.containsInAnyOrder(
                                        "P-Active", "P-Completed", "P-Cancelled")));
    }

    @Test
    @DisplayName("NPO autenticado com filtro ATIVOS retorna apenas ativos")
    void npoFiltersActive() throws Exception {
        mockMvc.perform(
                        get("/api/projects")
                                .param("status", "ATIVOS")
                                .with(jwt().jwt(j -> j.subject(NPO_AUTH0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("P-Active"))
                .andExpect(jsonPath("$[0].status").value("active"));
    }

    @Test
    @DisplayName("Filtro inválido retorna 400 com payload listando aceitos")
    void invalidFilterReturns400() throws Exception {
        mockMvc.perform(
                        get("/api/projects")
                                .param("status", "FOO")
                                .with(jwt().jwt(j -> j.subject(NPO_AUTH0))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(
                        jsonPath(
                                "$.message",
                                Matchers.allOf(
                                        Matchers.containsString("FOO"),
                                        Matchers.containsString("ATIVOS"),
                                        Matchers.containsString("COMPLETADOS"),
                                        Matchers.containsString("CANCELADOS"),
                                        Matchers.containsString("TODOS"))))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("User sem ONG/Empresa associada retorna 200 + lista vazia")
    void lonelyUserGetsEmptyList() throws Exception {
        mockMvc.perform(get("/api/projects").with(jwt().jwt(j -> j.subject(LONELY_AUTH0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(0)));
    }

    @Test
    @DisplayName("Company autenticada retorna projetos vinculados")
    void companyListsLinkedProjects() throws Exception {
        mockMvc.perform(get("/api/projects").with(jwt().jwt(j -> j.subject(COMPANY_AUTH0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("P-Active"));
    }
}
