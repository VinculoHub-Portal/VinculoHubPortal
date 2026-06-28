/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.service.DocumentCheckService;
import org.junit.jupiter.api.DisplayName;
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
        controllers = DocumentCheckController.class,
        excludeAutoConfiguration = {
            SecurityAutoConfiguration.class,
            SecurityFilterAutoConfiguration.class,
            OAuth2ResourceServerAutoConfiguration.class
        })
@AutoConfigureMockMvc(addFilters = false)
class DocumentCheckControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private DocumentCheckService documentCheckService;

    @Test
    @DisplayName("GET /public/validate/cnpj/{cnpj} retorna available=true quando CNPJ livre")
    void shouldReturnCnpjAvailable() throws Exception {
        when(documentCheckService.isCnpjAvailable("12345678000199")).thenReturn(true);

        mockMvc.perform(get("/public/validate/cnpj/12345678000199"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    @DisplayName("GET /public/validate/cnpj/{cnpj} retorna available=false quando CNPJ em uso")
    void shouldReturnCnpjUnavailable() throws Exception {
        when(documentCheckService.isCnpjAvailable("12345678000199")).thenReturn(false);

        mockMvc.perform(get("/public/validate/cnpj/12345678000199"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    @DisplayName("GET /public/validate/cpf/{cpf} retorna available=true quando CPF livre")
    void shouldReturnCpfAvailable() throws Exception {
        when(documentCheckService.isCpfAvailable("52998224725")).thenReturn(true);

        mockMvc.perform(get("/public/validate/cpf/52998224725"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    @DisplayName("GET /public/validate/cpf/{cpf} retorna available=false quando CPF em uso")
    void shouldReturnCpfUnavailable() throws Exception {
        when(documentCheckService.isCpfAvailable("52998224725")).thenReturn(false);

        mockMvc.perform(get("/public/validate/cpf/52998224725"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    @DisplayName("GET /public/validate/email retorna available=true quando e-mail livre")
    void shouldReturnEmailAvailable() throws Exception {
        when(documentCheckService.isEmailAvailable("novo@email.com")).thenReturn(true);

        mockMvc.perform(get("/public/validate/email").param("value", "novo@email.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    @DisplayName("GET /public/validate/email retorna available=false quando e-mail em uso")
    void shouldReturnEmailUnavailable() throws Exception {
        when(documentCheckService.isEmailAvailable("usado@email.com")).thenReturn(false);

        mockMvc.perform(get("/public/validate/email").param("value", "usado@email.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }
}
