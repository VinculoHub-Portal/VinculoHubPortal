/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.CnpjResponseDTO;
import com.vinculohub.backend.exception.CnpjInactiveException;
import com.vinculohub.backend.exception.CnpjNotFoundException;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@ExtendWith(MockitoExtension.class)
class CnpjValidationServiceTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private RestClient restClient;

    private CnpjValidationService service;

    @BeforeEach
    void setUp() {
        service = new CnpjValidationService();
        ReflectionTestUtils.setField(service, "restClient", restClient);
    }

    @Test
    @DisplayName("validate retorna DTO quando CNPJ é ativo")
    void shouldReturnDtoWhenCnpjIsActive() throws Exception {
        CnpjResponseDTO dto = new CnpjResponseDTO("12345678000195", "Razão", "Fantasia", "Ativa");
        when(restClient.get().uri(anyString()).retrieve().body(CnpjResponseDTO.class))
                .thenReturn(dto);

        CnpjResponseDTO result = service.validate("12.345.678/0001-95");

        assertNotNull(result);
        assertEquals("Ativa", result.situation());
    }

    @Test
    @DisplayName("validate lança CnpjNotFoundException quando API retorna 404")
    void shouldThrowCnpjNotFoundExceptionOnNotFound() {
        HttpClientErrorException.NotFound notFound =
                (HttpClientErrorException.NotFound)
                        HttpClientErrorException.create(
                                HttpStatus.NOT_FOUND,
                                "Not Found",
                                HttpHeaders.EMPTY,
                                new byte[0],
                                StandardCharsets.UTF_8);
        when(restClient.get().uri(anyString()).retrieve().body(CnpjResponseDTO.class))
                .thenThrow(notFound);

        assertThrows(CnpjNotFoundException.class, () -> service.validate("12.345.678/0001-95"));
    }

    @Test
    @DisplayName("validate lança CnpjInactiveException quando resultado é nulo")
    void shouldThrowCnpjInactiveExceptionWhenResultIsNull() {
        when(restClient.get().uri(anyString()).retrieve().body(CnpjResponseDTO.class))
                .thenReturn(null);

        assertThrows(CnpjInactiveException.class, () -> service.validate("12.345.678/0001-95"));
    }

    @Test
    @DisplayName("validate lança CnpjInactiveException quando situação não é Ativa")
    void shouldThrowCnpjInactiveExceptionWhenSituationIsNotAtiva() {
        CnpjResponseDTO inactive =
                new CnpjResponseDTO("12345678000195", "Razão", "Fantasia", "Baixada");
        when(restClient.get().uri(anyString()).retrieve().body(CnpjResponseDTO.class))
                .thenReturn(inactive);

        assertThrows(CnpjInactiveException.class, () -> service.validate("12.345.678/0001-95"));
    }
}
