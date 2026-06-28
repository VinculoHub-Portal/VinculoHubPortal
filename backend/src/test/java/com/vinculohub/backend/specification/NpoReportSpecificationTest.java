/* (C)2026 */
package com.vinculohub.backend.specification;

import static org.junit.jupiter.api.Assertions.*;

import com.vinculohub.backend.model.enums.NpoReportStatus;
import com.vinculohub.backend.repository.specification.NpoReportSpecification;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

class NpoReportSpecificationTest {

    @Test
    @DisplayName("npoNameContains retorna Specification não nula para nome válido")
    void shouldReturnNonNullSpecForValidNpoName() {
        Specification<?> spec = NpoReportSpecification.npoNameContains("ONG");
        assertNotNull(spec);
    }

    @Test
    @DisplayName("npoNameContains retorna Specification não nula para nome null")
    void shouldReturnNonNullSpecForNullNpoName() {
        Specification<?> spec = NpoReportSpecification.npoNameContains(null);
        assertNotNull(spec);
    }

    @Test
    @DisplayName("npoNameContains retorna Specification não nula para nome em branco")
    void shouldReturnNonNullSpecForBlankNpoName() {
        Specification<?> spec = NpoReportSpecification.npoNameContains("   ");
        assertNotNull(spec);
    }

    @Test
    @DisplayName("companyNameContains retorna Specification não nula para nome válido")
    void shouldReturnNonNullSpecForValidCompanyName() {
        Specification<?> spec = NpoReportSpecification.companyNameContains("Empresa");
        assertNotNull(spec);
    }

    @Test
    @DisplayName("companyNameContains retorna Specification não nula para nome null")
    void shouldReturnNonNullSpecForNullCompanyName() {
        Specification<?> spec = NpoReportSpecification.companyNameContains(null);
        assertNotNull(spec);
    }

    @Test
    @DisplayName("hasStatus retorna Specification não nula para status válido")
    void shouldReturnNonNullSpecForValidStatus() {
        Specification<?> spec = NpoReportSpecification.hasStatus(NpoReportStatus.OPEN);
        assertNotNull(spec);
    }

    @Test
    @DisplayName("hasStatus retorna Specification não nula para status null")
    void shouldReturnNonNullSpecForNullStatus() {
        Specification<?> spec = NpoReportSpecification.hasStatus(null);
        assertNotNull(spec);
    }

    @Test
    @DisplayName("from combina todas as especificações")
    void shouldCombineAllSpecifications() {
        Specification<?> spec = NpoReportSpecification.from("ONG", "Empresa", NpoReportStatus.OPEN);
        assertNotNull(spec);
    }

    @Test
    @DisplayName("from com todos os parâmetros nulos")
    void shouldCombineWithAllNullParams() {
        Specification<?> spec = NpoReportSpecification.from(null, null, null);
        assertNotNull(spec);
    }
}
