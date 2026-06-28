/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DocumentCheckServiceTest {

    @Mock private NpoRepository npoRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private DocumentCheckService documentCheckService;

    @Test
    @DisplayName("CNPJ disponível quando não existe em nenhum repositório")
    void shouldReturnTrueWhenCnpjNotInUse() {
        when(npoRepository.existsByCnpj("12345678000199")).thenReturn(false);
        when(companyRepository.existsByCnpj("12345678000199")).thenReturn(false);

        assertTrue(documentCheckService.isCnpjAvailable("12.345.678/0001-99"));
    }

    @Test
    @DisplayName("CNPJ indisponível quando existe na NPO")
    void shouldReturnFalseWhenCnpjInUseByNpo() {
        when(npoRepository.existsByCnpj("12345678000199")).thenReturn(true);

        assertFalse(documentCheckService.isCnpjAvailable("12345678000199"));
        verify(companyRepository, never()).existsByCnpj(any());
    }

    @Test
    @DisplayName("CNPJ indisponível quando existe na Company")
    void shouldReturnFalseWhenCnpjInUseByCompany() {
        when(npoRepository.existsByCnpj("12345678000199")).thenReturn(false);
        when(companyRepository.existsByCnpj("12345678000199")).thenReturn(true);

        assertFalse(documentCheckService.isCnpjAvailable("12345678000199"));
    }

    @Test
    @DisplayName("CNPJ nulo retorna disponível sem consultar repositório")
    void shouldReturnTrueForNullCnpj() {
        assertTrue(documentCheckService.isCnpjAvailable(null));
        verifyNoInteractions(npoRepository, companyRepository);
    }

    @Test
    @DisplayName("E-mail disponível quando não existe")
    void shouldReturnTrueWhenEmailNotInUse() {
        when(userRepository.existsByEmailIgnoreCase("novo@email.com")).thenReturn(false);

        assertTrue(documentCheckService.isEmailAvailable("novo@email.com"));
    }

    @Test
    @DisplayName("E-mail indisponível quando já cadastrado")
    void shouldReturnFalseWhenEmailInUse() {
        when(userRepository.existsByEmailIgnoreCase("existente@email.com")).thenReturn(true);

        assertFalse(documentCheckService.isEmailAvailable("existente@email.com"));
    }

    @Test
    @DisplayName("E-mail nulo retorna disponível sem consultar repositório")
    void shouldReturnTrueForNullEmail() {
        assertTrue(documentCheckService.isEmailAvailable(null));
        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("E-mail em branco retorna disponível sem consultar repositório")
    void shouldReturnTrueForBlankEmail() {
        assertTrue(documentCheckService.isEmailAvailable("   "));
        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("CPF disponível quando não existe")
    void shouldReturnTrueWhenCpfNotInUse() {
        when(npoRepository.existsByCpf("52998224725")).thenReturn(false);

        assertTrue(documentCheckService.isCpfAvailable("529.982.247-25"));
    }

    @Test
    @DisplayName("CPF indisponível quando existe")
    void shouldReturnFalseWhenCpfInUse() {
        when(npoRepository.existsByCpf("52998224725")).thenReturn(true);

        assertFalse(documentCheckService.isCpfAvailable("52998224725"));
    }

    @Test
    @DisplayName("CPF nulo retorna disponível sem consultar repositório")
    void shouldReturnTrueForNullCpf() {
        assertTrue(documentCheckService.isCpfAvailable(null));
        verifyNoInteractions(npoRepository);
    }
}
