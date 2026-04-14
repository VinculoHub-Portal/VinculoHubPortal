/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;

import com.vinculohub.backend.exception.EsgSelectionException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class NpoEsgServiceTest {

    private final NpoEsgService npoEsgService = new NpoEsgService();

    @Test
    @DisplayName("Deve aceitar quando apenas Environmental é selecionado")
    void shouldAcceptEnvironmentalOnly() {
        assertDoesNotThrow(() -> npoEsgService.validateEsgSelection(true, false, false));
    }

    @Test
    @DisplayName("Deve aceitar quando apenas Social é selecionado")
    void shouldAcceptSocialOnly() {
        assertDoesNotThrow(() -> npoEsgService.validateEsgSelection(false, true, false));
    }

    @Test
    @DisplayName("Deve aceitar quando apenas Governance é selecionado")
    void shouldAcceptGovernanceOnly() {
        assertDoesNotThrow(() -> npoEsgService.validateEsgSelection(false, false, true));
    }

    @Test
    @DisplayName("Deve aceitar quando todos os pilares são selecionados")
    void shouldAcceptAllSelected() {
        assertDoesNotThrow(() -> npoEsgService.validateEsgSelection(true, true, true));
    }

    @Test
    @DisplayName("Deve aceitar quando dois pilares são selecionados")
    void shouldAcceptTwoSelected() {
        assertDoesNotThrow(() -> npoEsgService.validateEsgSelection(true, true, false));
        assertDoesNotThrow(() -> npoEsgService.validateEsgSelection(true, false, true));
        assertDoesNotThrow(() -> npoEsgService.validateEsgSelection(false, true, true));
    }

    @Test
    @DisplayName("Deve lançar exceção quando nenhum pilar é selecionado")
    void shouldThrowWhenNoneSelected() {
        EsgSelectionException ex =
                assertThrows(
                        EsgSelectionException.class,
                        () -> npoEsgService.validateEsgSelection(false, false, false));
        assertTrue(ex.getMessage().contains("obrigatório"));
    }

    @Test
    @DisplayName("Deve lançar exceção quando todos são null")
    void shouldThrowWhenAllNull() {
        assertThrows(
                EsgSelectionException.class,
                () -> npoEsgService.validateEsgSelection(null, null, null));
    }

    @Test
    @DisplayName("Deve aceitar quando um é true e outros são null")
    void shouldAcceptOneSelectedWithNulls() {
        assertDoesNotThrow(() -> npoEsgService.validateEsgSelection(true, null, null));
        assertDoesNotThrow(() -> npoEsgService.validateEsgSelection(null, true, null));
        assertDoesNotThrow(() -> npoEsgService.validateEsgSelection(null, null, true));
    }
}
