/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.repository.ProjectRepository;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

class ProjectControllerErrorIntegrationTest extends AbstractIntegrationTest {

    private static final String NPO_AUTH0 = "auth0|npo-error";

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;

    @MockitoBean private ProjectRepository projectRepository;

    @BeforeEach
    void seed() {
        jdbcTemplate.update("DELETE FROM company_project");
        jdbcTemplate.update("DELETE FROM project");
        jdbcTemplate.update("DELETE FROM npo");
        jdbcTemplate.update("DELETE FROM users");

        Integer userId =
                jdbcTemplate.queryForObject(
                        "INSERT INTO users (name, email, auth0_id, user_type) VALUES ('ONG',"
                                + " 'ong-err@test.com', ?, 'npo'::user_type) RETURNING id",
                        Integer.class,
                        NPO_AUTH0);
        jdbcTemplate.update(
                "INSERT INTO npo (name, user_id, npo_size) "
                        + "VALUES ('ONG Erro', ?, 'small'::npo_size)",
                userId);

        when(projectRepository.findByNpoId(anyInt()))
                .thenThrow(new DataAccessResourceFailureException("DB indisponível"));
    }

    @Test
    @DisplayName("Falha no repository retorna 500 com payload estruturado e sem stack trace")
    void repositoryFailureReturns500WithStructuredPayload() throws Exception {
        mockMvc.perform(get("/api/projects").with(jwt().jwt(j -> j.subject(NPO_AUTH0))))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").value("Erro interno do servidor"))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(
                        jsonPath("$.message", Matchers.not(Matchers.containsString("DataAccess"))));
    }
}
