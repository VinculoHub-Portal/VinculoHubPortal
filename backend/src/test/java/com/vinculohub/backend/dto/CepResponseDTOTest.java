/* (C)2026 */
package com.vinculohub.backend.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CepResponseDTOTest {

    @Test
    @DisplayName("Deve construir CepResponseDTO a partir de CepRawResponseDTO")
    void shouldBuildFromRawDto() {
        CepRawResponseDTO raw =
                new CepRawResponseDTO(
                        "01310-100",
                        "Avenida Paulista",
                        "Complemento",
                        "São Paulo",
                        "SP",
                        "São Paulo",
                        null);

        CepResponseDTO dto = CepResponseDTO.from(raw);

        assertEquals("01310-100", dto.zipCode());
        assertEquals("Avenida Paulista", dto.street());
        assertEquals("Complemento", dto.complement());
        assertEquals("São Paulo", dto.city());
        assertEquals("SP", dto.stateCode());
        assertEquals("São Paulo", dto.state());
    }

    @Test
    @DisplayName("Deve mapear campos nulos do raw para o DTO")
    void shouldMapNullFieldsFromRaw() {
        CepRawResponseDTO raw = new CepRawResponseDTO(null, null, null, null, null, null, null);

        CepResponseDTO dto = CepResponseDTO.from(raw);

        assertNull(dto.zipCode());
        assertNull(dto.street());
        assertNull(dto.city());
        assertNull(dto.stateCode());
    }
}
