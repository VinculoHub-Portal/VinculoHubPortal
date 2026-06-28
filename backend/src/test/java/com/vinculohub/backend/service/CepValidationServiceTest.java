/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.CepRawResponseDTO;
import com.vinculohub.backend.dto.CepResponseDTO;
import com.vinculohub.backend.exception.CepNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

@ExtendWith(MockitoExtension.class)
class CepValidationServiceTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private RestClient restClient;

    private CepValidationService service;

    @BeforeEach
    void setUp() {
        service = new CepValidationService();
        ReflectionTestUtils.setField(service, "restClient", restClient);
    }

    @Test
    @DisplayName("validate retorna CepResponseDTO quando CEP é válido")
    void shouldReturnDtoWhenCepIsValid() {
        CepRawResponseDTO raw = new CepRawResponseDTO(
                "01310-100", "Avenida Paulista", null, "São Paulo", "SP", "São Paulo", null);
        when(restClient.get().uri(anyString()).retrieve().body(CepRawResponseDTO.class))
                .thenReturn(raw);

        CepResponseDTO result = service.validate("01310-100");

        assertNotNull(result);
        assertEquals("01310-100", result.zipCode());
        assertEquals("SP", result.stateCode());
    }

    @Test
    @DisplayName("validate lança CepNotFoundException quando resultado é nulo")
    void shouldThrowWhenRawIsNull() {
        when(restClient.get().uri(anyString()).retrieve().body(CepRawResponseDTO.class))
                .thenReturn(null);

        assertThrows(CepNotFoundException.class, () -> service.validate("00000-000"));
    }

    @Test
    @DisplayName("validate lança CepNotFoundException quando hasError é true")
    void shouldThrowWhenHasErrorIsTrue() {
        CepRawResponseDTO error = new CepRawResponseDTO(null, null, null, null, null, null, Boolean.TRUE);
        when(restClient.get().uri(anyString()).retrieve().body(CepRawResponseDTO.class))
                .thenReturn(error);

        assertThrows(CepNotFoundException.class, () -> service.validate("99999-999"));
    }
}
