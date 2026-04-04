/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.exception.DuplicateDocumentException;
import com.vinculohub.backend.exception.InvalidDocumentException;
import com.vinculohub.backend.repository.NpoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NpoDocumentServiceTest {

    @Mock private NpoRepository npoRepository;

    @InjectMocks private NpoDocumentService npoDocumentService;

    private static final String VALID_CPF = "52998224725";
    private static final String VALID_CNPJ = "11222333000181";

    @Nested
    @DisplayName("Regra: pelo menos um documento obrigatório")
    class AtLeastOneDocument {

        @Test
        @DisplayName("Deve lançar exceção quando CPF e CNPJ são null")
        void shouldThrowWhenBothNull() {
            InvalidDocumentException ex =
                    assertThrows(
                            InvalidDocumentException.class,
                            () -> npoDocumentService.validateDocuments(null, null));
            assertTrue(ex.getMessage().contains("obrigatório"));
        }

        @Test
        @DisplayName("Deve lançar exceção quando CPF e CNPJ são vazios")
        void shouldThrowWhenBothEmpty() {
            InvalidDocumentException ex =
                    assertThrows(
                            InvalidDocumentException.class,
                            () -> npoDocumentService.validateDocuments("", ""));
            assertTrue(ex.getMessage().contains("obrigatório"));
        }

        @Test
        @DisplayName("Deve lançar exceção quando CPF e CNPJ são espaços em branco")
        void shouldThrowWhenBothBlank() {
            assertThrows(
                    InvalidDocumentException.class,
                    () -> npoDocumentService.validateDocuments("   ", "   "));
        }
    }

    @Nested
    @DisplayName("Validação de formato")
    class FormatValidation {

        @Test
        @DisplayName("Deve lançar exceção para CPF inválido")
        void shouldThrowForInvalidCpf() {
            InvalidDocumentException ex =
                    assertThrows(
                            InvalidDocumentException.class,
                            () -> npoDocumentService.validateDocuments("12345678900", null));
            assertTrue(ex.getMessage().contains("CPF"));
        }

        @Test
        @DisplayName("Deve lançar exceção para CNPJ inválido")
        void shouldThrowForInvalidCnpj() {
            InvalidDocumentException ex =
                    assertThrows(
                            InvalidDocumentException.class,
                            () -> npoDocumentService.validateDocuments(null, "11222333000100"));
            assertTrue(ex.getMessage().contains("CNPJ"));
        }

        @Test
        @DisplayName("Deve aceitar CPF válido sem CNPJ")
        void shouldAcceptValidCpfOnly() {
            when(npoRepository.existsByCpf(VALID_CPF)).thenReturn(false);

            assertDoesNotThrow(() -> npoDocumentService.validateDocuments(VALID_CPF, null));
        }

        @Test
        @DisplayName("Deve aceitar CNPJ válido sem CPF")
        void shouldAcceptValidCnpjOnly() {
            when(npoRepository.existsByCnpj(VALID_CNPJ)).thenReturn(false);

            assertDoesNotThrow(() -> npoDocumentService.validateDocuments(null, VALID_CNPJ));
        }

        @Test
        @DisplayName("Deve aceitar ambos CPF e CNPJ válidos")
        void shouldAcceptBothValid() {
            when(npoRepository.existsByCpf(VALID_CPF)).thenReturn(false);
            when(npoRepository.existsByCnpj(VALID_CNPJ)).thenReturn(false);

            assertDoesNotThrow(() -> npoDocumentService.validateDocuments(VALID_CPF, VALID_CNPJ));
        }
    }

    @Nested
    @DisplayName("Unicidade no banco")
    class UniquenessValidation {

        @Test
        @DisplayName("Deve lançar exceção para CPF já cadastrado")
        void shouldThrowForDuplicateCpf() {
            when(npoRepository.existsByCpf(VALID_CPF)).thenReturn(true);

            DuplicateDocumentException ex =
                    assertThrows(
                            DuplicateDocumentException.class,
                            () -> npoDocumentService.validateDocuments(VALID_CPF, null));
            assertTrue(ex.getMessage().contains("CPF"));
        }

        @Test
        @DisplayName("Deve lançar exceção para CNPJ já cadastrado")
        void shouldThrowForDuplicateCnpj() {
            when(npoRepository.existsByCnpj(VALID_CNPJ)).thenReturn(true);

            DuplicateDocumentException ex =
                    assertThrows(
                            DuplicateDocumentException.class,
                            () -> npoDocumentService.validateDocuments(null, VALID_CNPJ));
            assertTrue(ex.getMessage().contains("CNPJ"));
        }

        @Test
        @DisplayName("Deve lançar exceção quando CPF é válido mas CNPJ é duplicado")
        void shouldThrowWhenCnpjDuplicate() {
            when(npoRepository.existsByCpf(VALID_CPF)).thenReturn(false);
            when(npoRepository.existsByCnpj(VALID_CNPJ)).thenReturn(true);

            assertThrows(
                    DuplicateDocumentException.class,
                    () -> npoDocumentService.validateDocuments(VALID_CPF, VALID_CNPJ));
        }
    }
}
