/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.dto.CompanyPublicProfileResponse;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.repository.CompanyRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CompanyPublicProfileServiceTest {

    @Mock private CompanyRepository companyRepository;
    @InjectMocks private CompanyService companyService;

    private Company company;

    @BeforeEach
    void setUp() {
        Address address =
                Address.builder()
                        .city("São Paulo")
                        .state("São Paulo")
                        .stateCode("SP")
                        .street("Rua Exemplo")
                        .number("123")
                        .complement("Sala 4")
                        .zipCode("01000-000")
                        .build();
        company = new Company();
        company.setId(42);
        company.setLegalName("ACME LTDA");
        company.setSocialName("ACME");
        company.setDescription("Empresa de tecnologia");
        company.setLogoUrl("https://logo");
        company.setCnpj("12.345.678/0001-90");
        company.setAddress(address);
    }

    @Test
    @DisplayName("getPublicProfile retorna DTO com campos públicos")
    void returnsPublicProfile() {
        when(companyRepository.findById(42)).thenReturn(Optional.of(company));

        CompanyPublicProfileResponse response = companyService.getPublicProfile(42);

        assertEquals(42, response.id());
        assertEquals("ACME LTDA", response.legalName());
        assertEquals("ACME", response.socialName());
        assertEquals("Empresa de tecnologia", response.description());
        assertEquals("https://logo", response.logoUrl());
        assertEquals("12.345.678/0001-90", response.cnpj());
        assertEquals("São Paulo", response.city());
        assertEquals("São Paulo", response.state());
        assertEquals("SP", response.stateCode());
        assertEquals("Rua Exemplo", response.street());
        assertEquals("123", response.number());
        assertEquals("Sala 4", response.complement());
        assertEquals("01000-000", response.zipCode());
        assertNull(response.segment());
        assertNull(response.website());
    }

    @Test
    @DisplayName("getPublicProfile lança NotFoundException quando id inexistente")
    void throwsWhenNotFound() {
        when(companyRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> companyService.getPublicProfile(999));
    }

    @Test
    @DisplayName("getPublicProfile lança BadRequestException quando id é nulo")
    void throwsWhenIdIsNull() {
        assertThrows(BadRequestException.class, () -> companyService.getPublicProfile(null));
    }

    @Test
    @DisplayName("getPublicProfile lida com address nulo")
    void handlesNullAddress() {
        Company noAddress = new Company();
        noAddress.setId(1);
        noAddress.setLegalName("X");
        noAddress.setSocialName("X");
        when(companyRepository.findById(1)).thenReturn(Optional.of(noAddress));

        CompanyPublicProfileResponse response = companyService.getPublicProfile(1);
        assertNull(response.city());
        assertNull(response.state());
        assertNull(response.stateCode());
        assertNull(response.street());
        assertNull(response.number());
        assertNull(response.complement());
        assertNull(response.zipCode());
    }
}
