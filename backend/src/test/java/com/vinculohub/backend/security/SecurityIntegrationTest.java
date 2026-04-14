/* (C)2026 */
package com.vinculohub.backend.security;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

class SecurityIntegrationTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @Test
    void publicEndpointShouldNotRequireAuthentication() throws Exception {
        mockMvc.perform(get("/public/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void protectedEndpointShouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointShouldReturnAuthenticatedJwtClaims() throws Exception {
        mockMvc.perform(
                        get("/api/me")
                                .with(
                                        jwt().jwt(
                                                        jwt ->
                                                                jwt.subject("auth0|123")
                                                                        .issuer(
                                                                                "https://test.auth0.com/")
                                                                        .audience(
                                                                                List.of(
                                                                                        "https://api.vinculohub"))
                                                                        .claim(
                                                                                "email",
                                                                                "user@example.com")
                                                                        .claim("name", "Test User")
                                                                        .claim(
                                                                                "scope",
                                                                                "read:profile")
                                                                        .claim(
                                                                                "https://vinculohub/roles",
                                                                                List.of(
                                                                                        "ADMIN",
                                                                                        "USER")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subject").value("auth0|123"))
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.audience", hasItem("https://api.vinculohub")))
                .andExpect(jsonPath("$.roles", containsInAnyOrder("ADMIN", "USER")));
    }
}
