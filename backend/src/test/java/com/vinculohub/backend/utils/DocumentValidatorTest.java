/* (C)2026 */
package com.vinculohub.backend.utils;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class DocumentValidatorTest {

    @Nested
    @DisplayName("Validação de CPF")
    class CpfValidation {

        @Test
        @DisplayName("Deve aceitar CPF válido")
        void shouldAcceptValidCpf() {
            assertTrue(DocumentValidator.isValidCpf("52998224725"));
        }

        @Test
        @DisplayName("Deve aceitar CPF válido com formatação")
        void shouldAcceptFormattedCpf() {
            assertTrue(DocumentValidator.isValidCpf("529.982.247-25"));
        }

        @Test
        @DisplayName("Deve rejeitar CPF com dígitos iguais")
        void shouldRejectAllSameDigits() {
            assertFalse(DocumentValidator.isValidCpf("11111111111"));
            assertFalse(DocumentValidator.isValidCpf("00000000000"));
        }

        @Test
        @DisplayName("Deve rejeitar CPF com dígito verificador errado")
        void shouldRejectInvalidCheckDigit() {
            assertFalse(DocumentValidator.isValidCpf("52998224726"));
        }

        @Test
        @DisplayName("Deve rejeitar CPF com tamanho errado")
        void shouldRejectWrongLength() {
            assertFalse(DocumentValidator.isValidCpf("1234567"));
            assertFalse(DocumentValidator.isValidCpf("123456789012"));
        }

        @Test
        @DisplayName("Deve rejeitar CPF null")
        void shouldRejectNull() {
            assertFalse(DocumentValidator.isValidCpf(null));
        }

        @Test
        @DisplayName("Deve rejeitar CPF vazio")
        void shouldRejectEmpty() {
            assertFalse(DocumentValidator.isValidCpf(""));
        }
    }

    @Nested
    @DisplayName("Validação de CNPJ")
    class CnpjValidation {

        @Test
        @DisplayName("Deve aceitar CNPJ válido")
        void shouldAcceptValidCnpj() {
            assertTrue(DocumentValidator.isValidCnpj("11222333000181"));
        }

        @Test
        @DisplayName("Deve aceitar CNPJ válido com formatação")
        void shouldAcceptFormattedCnpj() {
            assertTrue(DocumentValidator.isValidCnpj("11.222.333/0001-81"));
        }

        @Test
        @DisplayName("Deve rejeitar CNPJ com dígitos iguais")
        void shouldRejectAllSameDigits() {
            assertFalse(DocumentValidator.isValidCnpj("11111111111111"));
            assertFalse(DocumentValidator.isValidCnpj("00000000000000"));
        }

        @Test
        @DisplayName("Deve rejeitar CNPJ com dígito verificador errado")
        void shouldRejectInvalidCheckDigit() {
            assertFalse(DocumentValidator.isValidCnpj("11222333000182"));
        }

        @Test
        @DisplayName("Deve rejeitar CNPJ com tamanho errado")
        void shouldRejectWrongLength() {
            assertFalse(DocumentValidator.isValidCnpj("1122233300018"));
            assertFalse(DocumentValidator.isValidCnpj("112223330001811"));
        }

        @Test
        @DisplayName("Deve rejeitar CNPJ null")
        void shouldRejectNull() {
            assertFalse(DocumentValidator.isValidCnpj(null));
        }
    }

    @Nested
    @DisplayName("Sanitização de documento")
    class Sanitization {

        @Test
        @DisplayName("Deve remover pontos, traços e barras")
        void shouldRemoveFormatting() {
            assertEquals("52998224725", DocumentValidator.sanitize("529.982.247-25"));
            assertEquals("11222333000181", DocumentValidator.sanitize("11.222.333/0001-81"));
        }

        @Test
        @DisplayName("Deve retornar null para input null")
        void shouldReturnNullForNull() {
            assertNull(DocumentValidator.sanitize(null));
        }
    }
}
