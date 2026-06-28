/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;

import com.vinculohub.backend.dto.NpoFirstProjectSignupRequest;
import com.vinculohub.backend.model.enums.ProjectType;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ProjectValidationServiceTest {

    private final ProjectValidationService service = new ProjectValidationService();

    @Test
    @DisplayName("Deve validar request completo sem erros")
    void shouldPassWithValidRequest() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        "Projeto A",
                        "Descrição do projeto",
                        new BigDecimal("500.00"),
                        List.of("1", "2"),
                        ProjectType.SOCIAL_INVESTMENT_LAW);

        assertDoesNotThrow(() -> service.validateFirstProject(req));
    }

    @Test
    @DisplayName("Deve rejeitar request nulo")
    void shouldRejectNullRequest() {
        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> service.validateFirstProject(null));
        assertTrue(ex.getMessage().contains("obrigatórios"));
    }

    @Test
    @DisplayName("Deve rejeitar nome nulo")
    void shouldRejectNullName() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        null, "Descrição", BigDecimal.TEN, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW);

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> service.validateFirstProject(req));
        assertTrue(ex.getMessage().contains("Nome"));
    }

    @Test
    @DisplayName("Deve rejeitar nome em branco")
    void shouldRejectBlankName() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        "   ", "Descrição", BigDecimal.TEN, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW);

        assertThrows(IllegalArgumentException.class, () -> service.validateFirstProject(req));
    }

    @Test
    @DisplayName("Deve rejeitar descrição nula")
    void shouldRejectNullDescription() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        "Nome", null, BigDecimal.TEN, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW);

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> service.validateFirstProject(req));
        assertTrue(ex.getMessage().contains("Descrição") || ex.getMessage().contains("descrição"));
    }

    @Test
    @DisplayName("Deve rejeitar capital negativo")
    void shouldRejectNegativeCapital() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        "Nome",
                        "Descrição",
                        new BigDecimal("-1.00"),
                        List.of("1"),
                        ProjectType.SOCIAL_INVESTMENT_LAW);

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> service.validateFirstProject(req));
        assertTrue(ex.getMessage().contains("negativa"));
    }

    @Test
    @DisplayName("Deve aceitar capital null")
    void shouldAcceptNullCapital() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        "Nome", "Descrição", null, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW);

        assertDoesNotThrow(() -> service.validateFirstProject(req));
    }

    @Test
    @DisplayName("Deve aceitar capital zero")
    void shouldAcceptZeroCapital() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        "Nome", "Descrição", BigDecimal.ZERO, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW);

        assertDoesNotThrow(() -> service.validateFirstProject(req));
    }

    @Test
    @DisplayName("Deve rejeitar ODS nulo")
    void shouldRejectNullOds() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        "Nome", "Descrição", BigDecimal.TEN, null, ProjectType.SOCIAL_INVESTMENT_LAW);

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> service.validateFirstProject(req));
        assertTrue(ex.getMessage().contains("ODS"));
    }

    @Test
    @DisplayName("Deve rejeitar lista ODS vazia")
    void shouldRejectEmptyOds() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        "Nome", "Descrição", BigDecimal.TEN, List.of(), ProjectType.SOCIAL_INVESTMENT_LAW);

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> service.validateFirstProject(req));
        assertTrue(ex.getMessage().contains("ODS"));
    }

    @Test
    @DisplayName("Deve rejeitar ODS com valor em branco")
    void shouldRejectBlankOdsValue() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        "Nome", "Descrição", BigDecimal.TEN, List.of("1", "  "), ProjectType.SOCIAL_INVESTMENT_LAW);

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> service.validateFirstProject(req));
        assertTrue(ex.getMessage().contains("ODS"));
    }

    @Test
    @DisplayName("Deve rejeitar tipo nulo")
    void shouldRejectNullType() {
        NpoFirstProjectSignupRequest req =
                new NpoFirstProjectSignupRequest(
                        "Nome", "Descrição", BigDecimal.TEN, List.of("1"), null);

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> service.validateFirstProject(req));
        assertTrue(ex.getMessage().contains("Tipo"));
    }
}
