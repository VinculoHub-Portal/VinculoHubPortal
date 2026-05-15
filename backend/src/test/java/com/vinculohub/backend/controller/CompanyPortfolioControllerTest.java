/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.dto.CompanySupportedProjectsSummaryResponse;
import com.vinculohub.backend.service.CompanyPortfolioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = CompanyPortfolioController.class)
@TestPropertySource(
        properties = {"spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost"})
class CompanyPortfolioControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private CompanyPortfolioService companyPortfolioService;

    @Test
    void shouldReturnSupportedProjectsSummary() throws Exception {
        when(companyPortfolioService.getSupportedProjectsSummary("auth0|company"))
                .thenReturn(new CompanySupportedProjectsSummaryResponse(6L, 4L, 2L));

        mockMvc.perform(
                        get("/api/company/portfolio/summary")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|company"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(6))
                .andExpect(jsonPath("$.incentiveLaws").value(4))
                .andExpect(jsonPath("$.privateInvestment").value(2));
    }
}
