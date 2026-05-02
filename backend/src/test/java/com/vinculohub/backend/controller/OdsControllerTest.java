/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.dto.OdsResponse;
import com.vinculohub.backend.service.OdsService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = OdsController.class,
        excludeAutoConfiguration = {
            SecurityAutoConfiguration.class,
            SecurityFilterAutoConfiguration.class,
            OAuth2ResourceServerAutoConfiguration.class
        })
@AutoConfigureMockMvc(addFilters = false)
class OdsControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private OdsService odsService;

    @Test
    void shouldListOdsCatalogWithDescriptions() throws Exception {
        when(odsService.listResponses())
                .thenReturn(
                        List.of(
                                new OdsResponse(
                                        1,
                                        "ODS 1 - Erradicação da Pobreza",
                                        "Erradicar a pobreza em todas as formas, em todos os"
                                                + " lugares.")));

        mockMvc.perform(get("/public/ods"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("ODS 1 - Erradicação da Pobreza"))
                .andExpect(
                        jsonPath("$[0].description")
                                .value(
                                        "Erradicar a pobreza em todas as formas, em todos os"
                                                + " lugares."));
    }
}
